/*
 * PageDelta
 * String Utilities
 *
 * Shared, defensive text helpers used throughout
 * the content-side analysis pipeline.
 */

(function () {
    "use strict";


    /*
     * --------------------------------------------------
     * Clean text
     * --------------------------------------------------
     */

    function cleanText(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)

            .replace(
                /\u00A0/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();
    }


    /*
     * --------------------------------------------------
     * containsText
     * --------------------------------------------------
     *
     * Supports:
     *
     * containsText("hello world", "hello")
     *
     * containsText("hello world", "HELLO")
     *
     * containsText(
     *     "hello world",
     *     ["hello", "world"]
     * )
     *
     * containsText(
     *     "hello world",
     *     /hello/i
     * )
     */

    function containsText(
        text,
        search,
        caseSensitive = false
    ) {

        if (
            text === null ||
            text === undefined
        ) {
            return false;
        }


        if (
            search === null ||
            search === undefined
        ) {
            return false;
        }


        const source =
            String(text);


        /*
         * Empty source cannot contain
         * meaningful search text.
         */
        if (!source) {
            return false;
        }


        /*
         * Regular expression support.
         *
         * Reset lastIndex for global/sticky
         * regular expressions so repeated calls
         * behave consistently.
         */
        if (
            search instanceof RegExp
        ) {

            try {

                search.lastIndex = 0;

                const result =
                    search.test(source);

                search.lastIndex = 0;

                return result;

            } catch (error) {

                return false;
            }
        }


        /*
         * Array support.
         *
         * Any matching item returns true.
         */
        if (
            Array.isArray(search)
        ) {

            return search.some(
                item =>
                    containsText(
                        source,
                        item,
                        caseSensitive
                    )
            );
        }


        const searchText =
            String(search);


        /*
         * Empty search values should never
         * match everything.
         */
        if (!searchText) {
            return false;
        }


        if (!caseSensitive) {

            return source
                .toLowerCase()
                .includes(
                    searchText.toLowerCase()
                );
        }


        return source.includes(
            searchText
        );
    }


    /*
     * --------------------------------------------------
     * startsWithText
     * --------------------------------------------------
     */

    function startsWithText(
        text,
        search,
        caseSensitive = false
    ) {

        if (
            text === null ||
            text === undefined ||
            search === null ||
            search === undefined
        ) {
            return false;
        }


        const source =
            String(text);

        const value =
            String(search);


        if (!value) {
            return false;
        }


        if (!caseSensitive) {

            return source
                .toLowerCase()
                .startsWith(
                    value.toLowerCase()
                );
        }


        return source.startsWith(
            value
        );
    }


    /*
     * --------------------------------------------------
     * endsWithText
     * --------------------------------------------------
     */

    function endsWithText(
        text,
        search,
        caseSensitive = false
    ) {

        if (
            text === null ||
            text === undefined ||
            search === null ||
            search === undefined
        ) {
            return false;
        }


        const source =
            String(text);

        const value =
            String(search);


        if (!value) {
            return false;
        }


        if (!caseSensitive) {

            return source
                .toLowerCase()
                .endsWith(
                    value.toLowerCase()
                );
        }


        return source.endsWith(
            value
        );
    }


    /*
     * --------------------------------------------------
     * truncateText
     * --------------------------------------------------
     */

    function truncateText(
        value,
        maxLength = 500
    ) {

        const text =
            cleanText(value);


        const limit =
            Number(maxLength);


        if (
            !Number.isFinite(limit) ||
            limit <= 0
        ) {
            return "";
        }


        if (
            text.length <= limit
        ) {
            return text;
        }


        if (limit <= 3) {

            return text.substring(
                0,
                limit
            );
        }


        return (
            text.substring(
                0,
                limit - 3
            ) +
            "..."
        );
    }


    /*
     * --------------------------------------------------
     * normalizeText
     * --------------------------------------------------
     */

    function normalizeText(value) {

        return cleanText(value)
            .toLowerCase();
    }


    /*
     * --------------------------------------------------
     * isEmptyText
     * --------------------------------------------------
     */

    function isEmptyText(value) {

        return cleanText(value)
            .length === 0;
    }


    /*
     * --------------------------------------------------
     * uniqueStrings
     * --------------------------------------------------
     */

    function uniqueStrings(values) {

        if (
            !Array.isArray(values)
        ) {
            return [];
        }


        const seen =
            new Set();

        const result = [];


        values.forEach(value => {

            const text =
                cleanText(value);


            if (!text) {
                return;
            }


            const key =
                text.toLowerCase();


            if (
                seen.has(key)
            ) {
                return;
            }


            seen.add(key);

            result.push(text);
        });


        return result;
    }


    /*
     * --------------------------------------------------
     * getWords
     * --------------------------------------------------
     */

    function getWords(value) {

        const text =
            cleanText(value);


        if (!text) {
            return [];
        }


        return text
            .split(/\s+/)
            .filter(Boolean);
    }


    /*
     * --------------------------------------------------
     * Expose globally
     * --------------------------------------------------
     */

    globalThis.cleanText =
        cleanText;

    globalThis.containsText =
        containsText;

    globalThis.startsWithText =
        startsWithText;

    globalThis.endsWithText =
        endsWithText;

    globalThis.truncateText =
        truncateText;

    globalThis.normalizeText =
        normalizeText;

    globalThis.isEmptyText =
        isEmptyText;

    globalThis.uniqueStrings =
        uniqueStrings;

    globalThis.getWords =
        getWords;


    console.log(
        "[PageDelta] String utilities loaded."
    );

})();