/*
 * PageDelta
 * Sanitization utilities
 */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function sanitizeText(value) {

    return cleanText(
        String(value || "")
            .replace(
                /<script[\s\S]*?<\/script>/gi,
                ""
            )
            .replace(
                /<style[\s\S]*?<\/style>/gi,
                ""
            )
    );
}


function sanitizeURL(url) {

    if (!url) {
        return "";
    }

    try {

        const parsed =
            new URL(url);

        if (
            parsed.protocol !== "http:" &&
            parsed.protocol !== "https:"
        ) {
            return "";
        }

        return parsed.toString();

    } catch (error) {

        return "";
    }
}


function sanitizeObject(
    object
) {

    if (
        object === null ||
        object === undefined
    ) {
        return object;
    }


    if (typeof object === "string") {
        return sanitizeText(object);
    }


    if (Array.isArray(object)) {

        return object.map(
            item =>
                sanitizeObject(item)
        );
    }


    if (
        typeof object === "object"
    ) {

        const result = {};

        Object.keys(object)
            .forEach(key => {

                result[key] =
                    sanitizeObject(
                        object[key]
                    );
            });

        return result;
    }


    return object;
}


function isSafeURL(url) {

    return sanitizeURL(url) !== "";
}


if (typeof globalThis !== "undefined") {

    globalThis.escapeHTML =
        escapeHTML;

    globalThis.sanitizeText =
        sanitizeText;

    globalThis.sanitizeURL =
        sanitizeURL;

    globalThis.sanitizeObject =
        sanitizeObject;

    globalThis.isSafeURL =
        isSafeURL;
}