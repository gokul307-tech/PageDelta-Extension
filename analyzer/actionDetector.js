/*
 * PageDelta
 * Action Detector
 */

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


function detectActions(
    analysis
) {

    if (!analysis) {
        return [];
    }


    const results = [];


    /*
     * Analyze page text.
     */
    const pageText =
        analysis.pageText || "";


    Object.entries(
        ACTION_PATTERNS
    )
        .forEach(
            ([type, keywords]) => {

                keywords.forEach(
                    keyword => {

                        if (
                            containsText(
                                pageText,
                                keyword
                            )
                        ) 
                        {

                            results.push({

                                id:
                                    generateActionId(
                                        type,
                                        keyword
                                    ),

                                type,

                                label:
                                    keyword,

                                keyword,

                                source:
                                    "page-text",

                                completed:
                                    false,

                                detectedAt:
                                    Date.now()
                            });
                        }
                    }
                );
            }
        );


    /*
     * Analyze actual buttons.
     */
    if (
        Array.isArray(
            analysis.buttons
        )
    ) {

        analysis.buttons.forEach(
            button => {

                const text =
                    normalizeText(
                        button.text || ""
                    );


                Object.entries(
                    ACTION_PATTERNS
                )
                    .forEach(
                        ([type, keywords]) => {

                            if (
                                keywords.some(
                                    keyword =>
                                        text.includes(
                                            normalizeText(
                                                keyword
                                            )
                                        )
                                )
                            ) {

                                results.push({

                                    id:
                                        generateActionId(
                                            type,
                                            text
                                        ),

                                    type,

                                    label:
                                        button.text,

                                    source:
                                        "button",

                                    selector:
                                        button.selector ||
                                        "",

                                    completed:
                                        false,

                                    detectedAt:
                                        Date.now()
                                });
                            }
                        }
                    );
            }
        );
    }


    return removeDuplicateActions(
        results
    ).slice(
        0,
        PAGEDELTA.LIMITS.MAX_ACTIONS
    );
}


function generateActionId(
    type,
    value
) {

    return [
        "action",
        type,
        normalizeText(value)
            .replace(
                /[^a-z0-9]+/g,
                "-"
            ),
        Date.now()
    ].join("-");
}


function removeDuplicateActions(
    actions
) {

    const seen = new Set();

    return actions.filter(
        action => {

            const key =
                `${action.type}:${normalizeText(action.label)}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);

            return true;
        }
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.detectActions =
        detectActions;

    globalThis.generateActionId =
        generateActionId;
}