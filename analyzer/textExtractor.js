/*
 * PageDelta
 * Text Extraction Engine
 *
 * Extracts meaningful visible page text while
 * avoiding scripts, media, navigation noise and
 * excessively large DOM payloads.
 */

(function () {
    "use strict";


    /*
     * --------------------------------------------------
     * Safe limit helpers
     * --------------------------------------------------
     */

    function getLimit(
        name,
        fallback
    ) {

        if (
            typeof PAGEDELTA !==
            "undefined" &&
            PAGEDELTA.LIMITS &&
            Number.isFinite(
                PAGEDELTA.LIMITS[name]
            )
        ) {

            return PAGEDELTA.LIMITS[name];
        }


        return fallback;
    }


    /*
     * --------------------------------------------------
     * Extract complete page text
     * --------------------------------------------------
     */

    function extractPageText() {

        if (!document.body) {
            return "";
        }


        try {

            const clonedBody =
                document.body.cloneNode(true);


            const elementsToRemove =
                clonedBody.querySelectorAll(
                    [
                        "script",
                        "style",
                        "noscript",
                        "svg",
                        "canvas",
                        "iframe",
                        "video",
                        "audio",
                        "nav",
                        "footer",
                        "template"
                    ].join(",")
                );


            elementsToRemove.forEach(
                element =>
                    element.remove()
            );


            const text =
                clonedBody.innerText ||
                clonedBody.textContent ||
                "";


            return cleanText(text)
                .substring(
                    0,
                    getLimit(
                        "MAX_TEXT_LENGTH",
                        50000
                    )
                );

        } catch (error) {

            console.error(
                "[PageDelta] Page text extraction failed:",
                error
            );

            return "";
        }
    }


    /*
     * --------------------------------------------------
     * Extract visible text elements
     * --------------------------------------------------
     */

    function extractVisibleTextElements() {

        if (!document.body) {
            return [];
        }


        const maxElements =
            getLimit(
                "MAX_VISIBLE_ELEMENTS",
                1000
            );


        const maxTextLength =
            getLimit(
                "MAX_ELEMENT_TEXT_LENGTH",
                500
            );


        try {

            const elements =
                document.body.querySelectorAll(
                    [
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "p",
                        "li",
                        "label",
                        "button",
                        "a",
                        "td",
                        "th",
                        "strong"
                    ].join(",")
                );


            const results = [];


            elements.forEach(element => {

                if (
                    results.length >=
                    maxElements
                ) {
                    return;
                }


                if (
                    typeof isElementVisible ===
                    "function" &&
                    !isElementVisible(element)
                ) {
                    return;
                }


                const text =
                    cleanText(
                        element.innerText ||
                        element.textContent ||
                        ""
                    );


                if (
                    !text ||
                    text.length < 2
                ) {
                    return;
                }


                results.push({

                    tag:
                        String(
                            element.tagName ||
                            ""
                        ).toLowerCase(),

                    text:
                        truncateText(
                            text,
                            maxTextLength
                        )
                });

            });


            return results;

        } catch (error) {

            console.error(
                "[PageDelta] Visible text extraction failed:",
                error
            );

            return [];
        }
    }


    /*
     * --------------------------------------------------
     * Extract headings
     * --------------------------------------------------
     */

    function extractHeadings() {

        try {

            const maxHeadings =
                getLimit(
                    "MAX_HEADINGS",
                    getLimit(
                        "MAX_HEADING_COUNT",
                        100
                    )
                );


            const headings =
                document.querySelectorAll(
                    "h1, h2, h3, h4, h5, h6"
                );


            return Array.from(headings)

                .map(element => {

                    const tag =
                        String(
                            element.tagName ||
                            ""
                        );


                    return {

                        level:
                            Number(
                                tag.substring(1)
                            ),

                        text:
                            cleanText(
                                element.innerText ||
                                element.textContent ||
                                ""
                            )
                    };

                })

                .filter(item =>
                    item.text
                )

                .slice(
                    0,
                    maxHeadings
                );

        } catch (error) {

            console.error(
                "[PageDelta] Heading extraction failed:",
                error
            );

            return [];
        }
    }


    /*
     * --------------------------------------------------
     * Extract paragraphs
     * --------------------------------------------------
     */

    function extractParagraphs() {

        try {

            return Array.from(
                document.querySelectorAll("p")
            )

                .map(element =>
                    cleanText(
                        element.innerText ||
                        element.textContent ||
                        ""
                    )
                )

                .filter(
                    text =>
                        text.length > 1
                )

                .slice(0, 500);

        } catch (error) {

            return [];
        }
    }


    /*
     * --------------------------------------------------
     * Extract list items
     * --------------------------------------------------
     */

    function extractLists() {

        try {

            return Array.from(
                document.querySelectorAll("li")
            )

                .map(element =>
                    cleanText(
                        element.innerText ||
                        element.textContent ||
                        ""
                    )
                )

                .filter(
                    text =>
                        text.length > 1
                )

                .slice(0, 500);

        } catch (error) {

            return [];
        }
    }


    /*
     * --------------------------------------------------
     * Export
     * --------------------------------------------------
     */

    globalThis.extractPageText =
        extractPageText;

    globalThis.extractVisibleTextElements =
        extractVisibleTextElements;

    globalThis.extractHeadings =
        extractHeadings;

    globalThis.extractParagraphs =
        extractParagraphs;

    globalThis.extractLists =
        extractLists;


    console.log(
        "[PageDelta] Text extractor loaded."
    );

})();