/*
 * PageDelta
 * Main Page Analyzer
 */

(function () {
    "use strict";

    /*
     * --------------------------------------------------
     * Configuration
     * --------------------------------------------------
     */

    function getPageDelta() {
        if (
            typeof globalThis !== "undefined" &&
            globalThis.PAGEDELTA
        ) {
            return globalThis.PAGEDELTA;
        }

        return {
            VERSION: "1.0.0",

            LIMITS: {
                MAX_TEXT_LENGTH: 50000,
                MAX_FIELDS: 200,
                MAX_VISIBLE_ELEMENTS: 1000
            }
        };
    }

    const CONFIG = getPageDelta();


    /*
     * --------------------------------------------------
     * Basic helper functions
     * --------------------------------------------------
     */

    function clean(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        try {
            if (
                typeof globalThis.cleanText === "function"
            ) {
                return globalThis.cleanText(value);
            }
        } catch (error) {
            // Continue with local cleaning.
        }

        return String(value)
            .replace(/\u00A0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }


    /*
     * IMPORTANT:
     * This was missing in the previous version.
     *
     * Safely checks whether text contains a
     * given string.
     */
    function containsText(text, searchText) {
        if (
            text === null ||
            text === undefined ||
            searchText === null ||
            searchText === undefined
        ) {
            return false;
        }

        const source =
            String(text).toLowerCase();

        const target =
            String(searchText).toLowerCase();

        if (!target) {
            return false;
        }

        return source.includes(target);
    }


    /*
     * Safely call functions provided by
     * other PageDelta analyzer modules.
     */
    function safeCall(
        functionName,
        args,
        fallback
    ) {
        try {
            const fn =
                globalThis[functionName];

            if (typeof fn !== "function") {
                console.warn(
                    "[PageDelta] Function not available:",
                    functionName
                );

                return fallback;
            }

            return fn.apply(
                globalThis,
                args || []
            );

        } catch (error) {
            console.warn(
                "[PageDelta] " +
                functionName +
                " failed:",
                error
            );

            return fallback;
        }
    }


    /*
     * --------------------------------------------------
     * Element visibility
     * --------------------------------------------------
     */

    function elementIsVisible(element) {
        if (!element) {
            return false;
        }

        try {
            if (
                typeof globalThis.isElementVisible ===
                "function"
            ) {
                return globalThis.isElementVisible(
                    element
                );
            }

            if (
                !(element instanceof Element)
            ) {
                return false;
            }

            const style =
                window.getComputedStyle(element);

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.opacity === "0"
            ) {
                return false;
            }

            const rect =
                element.getBoundingClientRect();

            return (
                rect.width > 0 &&
                rect.height > 0
            );

        } catch (error) {
            return false;
        }
    }


    /*
     * --------------------------------------------------
     * Element text
     * --------------------------------------------------
     */

    function getElementText(element) {
        if (!element) {
            return "";
        }

        return clean(
            element.innerText ||
            element.textContent ||
            ""
        );
    }


    /*
     * --------------------------------------------------
     * Attribute helper
     * --------------------------------------------------
     */

    function getAttribute(
        element,
        attribute
    ) {
        if (
            !element ||
            !attribute
        ) {
            return "";
        }

        try {
            return clean(
                element.getAttribute(
                    attribute
                ) || ""
            );
        } catch (error) {
            return "";
        }
    }


    /*
     * --------------------------------------------------
     * CSS selector generator
     * --------------------------------------------------
     */

    function getElementSelector(element) {
        if (!element) {
            return "";
        }

        try {
            if (element.id) {
                return (
                    "#" +
                    CSS.escape(element.id)
                );
            }

            const parts = [];

            let current = element;

            while (
                current &&
                current.nodeType === 1 &&
                current !== document.body
            ) {
                let selector =
                    current.tagName.toLowerCase();

                if (
                    current.classList &&
                    current.classList.length
                ) {
                    const classes =
                        Array.from(
                            current.classList
                        )
                        .filter(
                            className =>
                                /^[a-zA-Z0-9_-]+$/
                                    .test(className)
                        )
                        .slice(0, 2);

                    if (classes.length) {
                        selector +=
                            "." +
                            classes.join(".");
                    }
                }

                const parent =
                    current.parentElement;

                if (parent) {
                    const siblings =
                        Array.from(
                            parent.children
                        )
                        .filter(
                            child =>
                                child.tagName ===
                                current.tagName
                        );

                    if (siblings.length > 1) {
                        const index =
                            siblings.indexOf(
                                current
                            ) + 1;

                        selector +=
                            `:nth-of-type(${index})`;
                    }
                }

                parts.unshift(selector);

                current =
                    current.parentElement;
            }

            return parts.join(" > ");

        } catch (error) {
            return "";
        }
    }


    /*
     * --------------------------------------------------
     * Find form inputs
     * --------------------------------------------------
     */

    function findInputs() {
        if (
            typeof document === "undefined" ||
            !document.body
        ) {
            return [];
        }

        return Array.from(
            document.querySelectorAll(
                "input, textarea, select"
            )
        );
    }


    /*
     * --------------------------------------------------
     * Find buttons
     * --------------------------------------------------
     */

    function findButtons() {
        if (
            typeof document === "undefined" ||
            !document.body
        ) {
            return [];
        }

        return Array.from(
            document.querySelectorAll(
                [
                    "button",
                    "input[type='button']",
                    "input[type='submit']",
                    "input[type='reset']",
                    "[role='button']"
                ].join(",")
            )
        );
    }


    /*
     * --------------------------------------------------
     * Associated label
     * --------------------------------------------------
     */

    function getAssociatedLabel(element) {
        if (!element) {
            return "";
        }

        try {
            /*
             * label[for="id"]
             */
            if (element.id) {
                const label =
                    document.querySelector(
                        `label[for="${CSS.escape(
                            element.id
                        )}"]`
                    );

                if (label) {
                    return getElementText(label);
                }
            }


            /*
             * Parent label
             */
            const parentLabel =
                element.closest("label");

            if (parentLabel) {
                return getElementText(
                    parentLabel
                );
            }


            /*
             * aria-label
             */
            const ariaLabel =
                getAttribute(
                    element,
                    "aria-label"
                );

            if (ariaLabel) {
                return ariaLabel;
            }


            /*
             * aria-labelledby
             */
            const labelledBy =
                getAttribute(
                    element,
                    "aria-labelledby"
                );

            if (labelledBy) {
                const ids =
                    labelledBy.split(/\s+/);

                const texts =
                    ids
                        .map(id => {
                            const label =
                                document.getElementById(
                                    id
                                );

                            return label
                                ? getElementText(label)
                                : "";
                        })
                        .filter(Boolean);

                if (texts.length) {
                    return texts.join(" ");
                }
            }

        } catch (error) {
            // Ignore label errors.
        }

        return "";
    }


    /*
     * --------------------------------------------------
     * Element context
     * --------------------------------------------------
     */

    function getElementContext(element) {
        if (!element) {
            return "";
        }

        try {
            const parent =
                element.parentElement;

            if (!parent) {
                return "";
            }

            return clean(
                parent.innerText ||
                parent.textContent ||
                ""
            ).substring(0, 500);

        } catch (error) {
            return "";
        }
    }


    /*
     * --------------------------------------------------
     * Extract form fields
     * --------------------------------------------------
     */

    function extractFormFields() {
        const elements =
            findInputs();

        return elements
            .filter(element =>
                elementIsVisible(element)
            )
            .map(element => {

                let type =
                    getAttribute(
                        element,
                        "type"
                    );

                if (!type) {
                    type =
                        element.tagName
                            .toLowerCase();
                }

                return {
                    tag:
                        element.tagName
                            .toLowerCase(),

                    type:
                        type.toLowerCase(),

                    name:
                        getAttribute(
                            element,
                            "name"
                        ),

                    id:
                        element.id || "",

                    placeholder:
                        getAttribute(
                            element,
                            "placeholder"
                        ),

                    ariaLabel:
                        getAttribute(
                            element,
                            "aria-label"
                        ),

                    label:
                        getAssociatedLabel(
                            element
                        ),

                    context:
                        getElementContext(
                            element
                        ),

                    required:
                        element.required === true,

                    disabled:
                        element.disabled === true,

                    selector:
                        getElementSelector(
                            element
                        )
                };
            })
            .slice(
                0,
                (
                    CONFIG.LIMITS &&
                    CONFIG.LIMITS.MAX_FIELDS
                )
                    ? CONFIG.LIMITS.MAX_FIELDS
                    : 200
            );
    }


    /*
     * --------------------------------------------------
     * Extract buttons
     * --------------------------------------------------
     */

    function extractButtons() {
        return findButtons()
            .filter(button =>
                elementIsVisible(button)
            )
            .map(button => {

                const text =
                    getElementText(button);

                const ariaLabel =
                    getAttribute(
                        button,
                        "aria-label"
                    );

                return {
                    text,

                    type:
                        getAttribute(
                            button,
                            "type"
                        ),

                    ariaLabel,

                    selector:
                        getElementSelector(
                            button
                        )
                };
            })
            .filter(button =>
                button.text ||
                button.ariaLabel
            )
            .slice(0, 200);
    }


    /*
     * --------------------------------------------------
     * Main page analyzer
     * --------------------------------------------------
     */

    async function analyzePage() {
        try {

            console.log(
                "[PageDelta] Starting page analysis..."
            );


            /*
             * Page text
             */
            const pageText =
                safeCall(
                    "extractPageText",
                    [],
                    ""
                );


            /*
             * Visible elements
             */
            const visibleElements =
                safeCall(
                    "extractVisibleTextElements",
                    [],
                    []
                );


            /*
             * Headings
             */
            const headings =
                safeCall(
                    "extractHeadings",
                    [],
                    []
                );


            /*
             * Metadata
             */
            const metadata =
                safeCall(
                    "extractMetadata",
                    [],
                    {}
                );


            /*
             * Dates
             */
            const dates =
                safeCall(
                    "detectDates",
                    [pageText],
                    []
                );


            /*
             * Deadlines
             */
            const deadlines =
                safeCall(
                    "detectDeadlines",
                    [pageText],
                    []
                );


            /*
             * Prices
             */
            const prices =
                safeCall(
                    "detectPrices",
                    [pageText],
                    []
                );


            /*
             * Requirements
             */
            const requirements =
                safeCall(
                    "detectRequirements",
                    [pageText],
                    []
                );


            /*
             * Contacts
             */
            const contacts =
                safeCall(
                    "detectContacts",
                    [pageText],
                    []
                );


            /*
             * Keywords
             */
            const keywords =
                safeCall(
                    "findKeywords",
                    [pageText],
                    []
                );


            /*
             * Form fields
             */
            const fields =
                extractFormFields();


            /*
             * Buttons
             */
            const buttons =
                extractButtons();


            /*
             * Build analysis
             */
            const analysis = {

                version:
                    CONFIG.VERSION ||
                    "1.0.0",

                timestamp:
                    Date.now(),

                url:
                    window.location.href,

                title:
                    document.title || "",

                metadata,

                pageText,

                headings,

                visibleElements,

                fields,

                buttons,

                dates,

                deadlines,

                prices,

                requirements,

                contacts,

                keywords,

                actions: [],

                importance: 0,

                importanceLevel: "low"
            };


            /*
             * Actions
             */
            const actions =
                safeCall(
                    "detectActions",
                    [analysis],
                    []
                );

            if (Array.isArray(actions)) {
                analysis.actions =
                    actions;
            }


            /*
             * Importance
             */
            const importance =
                safeCall(
                    "calculateImportance",
                    [analysis],
                    0
                );

            if (
                typeof importance ===
                "number"
            ) {
                analysis.importance =
                    importance;
            }


            /*
             * Importance level
             */
            const importanceLevel =
                safeCall(
                    "getImportanceLevel",
                    [analysis.importance],
                    null
                );

            if (importanceLevel) {
                analysis.importanceLevel =
                    importanceLevel;
            } else if (
                analysis.importance >= 80
            ) {
                analysis.importanceLevel =
                    "critical";
            } else if (
                analysis.importance >= 60
            ) {
                analysis.importanceLevel =
                    "high";
            } else if (
                analysis.importance >= 30
            ) {
                analysis.importanceLevel =
                    "medium";
            } else {
                analysis.importanceLevel =
                    "low";
            }


            /*
             * Final validation
             */
            if (
                !analysis ||
                typeof analysis !== "object"
            ) {
                console.error(
                    "[PageDelta] Analysis object invalid."
                );

                return null;
            }


            console.log(
                "[PageDelta] Page analyzed successfully:",
                {
                    url:
                        analysis.url,

                    textLength:
                        analysis.pageText.length,

                    headings:
                        analysis.headings.length,

                    visibleElements:
                        analysis.visibleElements.length,

                    fields:
                        analysis.fields.length,

                    buttons:
                        analysis.buttons.length,

                    dates:
                        analysis.dates.length,

                    deadlines:
                        analysis.deadlines.length,

                    prices:
                        analysis.prices.length,

                    requirements:
                        analysis.requirements.length,

                    contacts:
                        analysis.contacts.length,

                    actions:
                        analysis.actions.length,

                    importance:
                        analysis.importance
                }
            );


            return analysis;

        } catch (error) {

            console.error(
                "[PageDelta] Analyzer error:",
                error
            );

            return null;
        }
    }


    /*
     * --------------------------------------------------
     * Export functions
     * --------------------------------------------------
     */

    globalThis.containsText =
        containsText;

    globalThis.analyzePage =
        analyzePage;

    globalThis.extractFormFields =
        extractFormFields;

    globalThis.extractButtons =
        extractButtons;


    console.log(
        "[PageDelta] Page analyzer loaded successfully."
    );

})();