/*
 * PageDelta
 * Action Detector
 *
 * Detects meaningful user actions available on
 * a webpage. Detection is descriptive only.
 *
 * PageDelta NEVER automatically submits important
 * forms or performs sensitive actions.
 */

(function () {
    "use strict";


    const ACTION_PATTERNS = {

        submit: [
            "submit",
            "send application",
            "submit form"
        ],

        register: [
            "register",
            "registration",
            "sign up",
            "create account"
        ],

        login: [
            "login",
            "log in",
            "sign in"
        ],

        apply: [
            "apply",
            "application",
            "apply now"
        ],

        download: [
            "download",
            "download now",
            "get file"
        ],

        upload: [
            "upload",
            "attach file",
            "choose file"
        ],

        purchase: [
            "buy now",
            "purchase",
            "order now",
            "checkout"
        ],

        book: [
            "book now",
            "book",
            "reserve"
        ],

        contact: [
            "contact us",
            "contact",
            "get in touch"
        ]
    };


    /*
     * --------------------------------------------------
     * Safe action limit
     * --------------------------------------------------
     */

    function getMaxActions() {

        if (
            typeof PAGEDELTA !==
            "undefined" &&
            PAGEDELTA.LIMITS &&
            Number.isFinite(
                PAGEDELTA.LIMITS.MAX_ACTIONS
            )
        ) {

            return PAGEDELTA.LIMITS.MAX_ACTIONS;
        }


        return 100;
    }


    /*
     * --------------------------------------------------
     * Detect actions
     * --------------------------------------------------
     */

    function detectActions(
        analysis
    ) {

        if (
            !analysis ||
            typeof analysis !== "object"
        ) {
            return [];
        }


        const results = [];


        const pageText =
            typeof analysis.pageText === "string"
                ? analysis.pageText
                : "";


        /*
         * ------------------------------------------------
         * Page-text detection
         * ------------------------------------------------
         */

        Object.entries(
            ACTION_PATTERNS
        ).forEach(
            ([type, keywords]) => {

                keywords.forEach(
                    keyword => {

                        if (
                            containsText(
                                pageText,
                                keyword
                            )
                        ) {

                            results.push({

                                id:
                                    generateActionId(
                                        type,
                                        keyword,
                                        "page-text"
                                    ),

                                type,

                                label:
                                    keyword,

                                keyword,

                                source:
                                    "page-text",

                                completed:
                                    false,

                                requiresConfirmation:
                                    requiresActionConfirmation(
                                        type
                                    ),

                                detectedAt:
                                    Date.now()
                            });
                        }

                    }
                );
            }
        );


        /*
         * ------------------------------------------------
         * Actual button detection
         * ------------------------------------------------
         */

        if (
            Array.isArray(
                analysis.buttons
            )
        ) {

            analysis.buttons.forEach(
                button => {

                    if (
                        !button ||
                        results.length >=
                        getMaxActions() * 2
                    ) {
                        return;
                    }


                    const text =
                        normalizeText(
                            button.text ||
                            button.ariaLabel ||
                            ""
                        );


                    if (!text) {
                        return;
                    }


                    Object.entries(
                        ACTION_PATTERNS
                    ).forEach(
                        ([type, keywords]) => {

                            if (
                                results.length >=
                                getMaxActions() * 2
                            ) {
                                return;
                            }


                            const matchedKeyword =
                                keywords.find(
                                    keyword =>
                                        containsText(
                                            text,
                                            normalizeText(
                                                keyword
                                            )
                                        )
                                );


                            if (
                                !matchedKeyword
                            ) {
                                return;
                            }


                            results.push({

                                id:
                                    generateActionId(
                                        type,
                                        text,
                                        "button"
                                    ),

                                type,

                                label:
                                    cleanText(
                                        button.text ||
                                        button.ariaLabel ||
                                        matchedKeyword
                                    ),

                                keyword:
                                    matchedKeyword,

                                source:
                                    "button",

                                selector:
                                    button.selector ||
                                    "",

                                completed:
                                    false,

                                requiresConfirmation:
                                    requiresActionConfirmation(
                                        type
                                    ),

                                detectedAt:
                                    Date.now()
                            });

                        }
                    );

                }
            );
        }


        /*
         * Remove duplicates and apply final limit.
         */

        return removeDuplicateActions(
            results
        ).slice(
            0,
            getMaxActions()
        );
    }


    /*
     * --------------------------------------------------
     * Generate action ID
     * --------------------------------------------------
     *
     * Do not include Date.now() here.
     *
     * A stable ID is much more useful for detecting
     * the same action across repeated page analyses.
     */

    function generateActionId(
        type,
        value,
        source = ""
    ) {

        const normalizedType =
            normalizeText(type)
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                );


        const normalizedValue =
            normalizeText(value)
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                );


        const normalizedSource =
            normalizeText(source)
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                );


        return [
            "action",
            normalizedType,
            normalizedValue,
            normalizedSource
        ]
            .filter(Boolean)
            .join("-");
    }


    /*
     * --------------------------------------------------
     * Remove duplicate actions
     * --------------------------------------------------
     */

    function removeDuplicateActions(
        actions
    ) {

        if (
            !Array.isArray(actions)
        ) {
            return [];
        }


        const seen =
            new Set();


        return actions.filter(
            action => {

                if (!action) {
                    return false;
                }


                const key = [

                    action.type,

                    normalizeText(
                        action.label ||
                        action.keyword ||
                        ""
                    ),

                    action.source ||
                    ""

                ].join(":");


                if (
                    seen.has(key)
                ) {
                    return false;
                }


                seen.add(key);

                return true;
            }
        );
    }


    /*
     * --------------------------------------------------
     * Confirmation policy
     * --------------------------------------------------
     *
     * This does NOT execute anything.
     *
     * It simply tells later UI layers whether the
     * action should require user confirmation.
     */

    function requiresActionConfirmation(
        type
    ) {

        const sensitiveActions = [

            "submit",

            "purchase",

            "book",

            "upload",

            "apply",

            "register",

            "login"

        ];


        return sensitiveActions.includes(
            String(type)
                .toLowerCase()
        );
    }


    /*
     * --------------------------------------------------
     * Public exports
     * --------------------------------------------------
     */

    globalThis.ACTION_PATTERNS =
        ACTION_PATTERNS;

    globalThis.detectActions =
        detectActions;

    globalThis.generateActionId =
        generateActionId;

    globalThis.removeDuplicateActions =
        removeDuplicateActions;

    globalThis.requiresActionConfirmation =
        requiresActionConfirmation;


    console.log(
        "[PageDelta] Action detector loaded."
    );

})();