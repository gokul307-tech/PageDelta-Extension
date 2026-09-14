/*
 * PageDelta
 * String Utilities
 */

(function () {
    "use strict";

    /*
     * Clean and normalize text.
     */
    function cleanText(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/\u00A0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }


    /*
     * Check whether text contains a value.
     *
     * Supports:
     *
     * containsText("hello world", "hello")
     *
     * containsText("hello world", "HELLO")
     *
     * containsText("hello world", ["hello", "world"])
     *
     * containsText("hello world", /hello/i)
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
         * Regular expression support.
         */
        if (
            search instanceof RegExp
        ) {

            return search.test(source);
        }


        /*
         * Array support.
         *
         * Returns true if at least one
         * search value exists.
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


        /*
         * Convert search value to string.
         */
        const searchText =
            String(search);


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
     * Check whether text starts with
     * a specific value.
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
     * Check whether text ends with
     * a specific value.
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
     * Truncate text.
     */
    function truncateText(
        value,
        maxLength = 500
    ) {

        const text =
            cleanText(value);


        if (
            text.length <= maxLength
        ) {
            return text;
        }


        if (maxLength <= 3) {

            return text.substring(
                0,
                maxLength
            );
        }


        return (
            text.substring(
                0,
                maxLength - 3
            ) +
            "..."
        );
    }


    /*
     * Convert text to lowercase safely.
     */
    function normalizeText(value) {

        return cleanText(value)
            .toLowerCase();
    }


    /*
     * Check whether a value is empty.
     */
    function isEmptyText(value) {

        return cleanText(value)
            .length === 0;
    }


    /*
     * Remove duplicate strings.
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
     * Split text into words.
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
     * Export globally.
     *
     * PageDelta uses global functions
     * because the extension is currently
     * not using ES modules.
     */
    if (
        typeof globalThis !==
        "undefined"
    ) {

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
    }


    console.log(
        "[PageDelta] String utilities loaded."
    );

})();