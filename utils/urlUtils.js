/*
 * PageDelta
 * URL utilities
 */

function getCurrentURL() {

    if (
        typeof window === "undefined"
    ) {
        return "";
    }

    return window.location.href;
}


function getCurrentOrigin() {

    if (
        typeof window === "undefined"
    ) {
        return "";
    }

    return window.location.origin;
}


function getCurrentHostname() {

    if (
        typeof window === "undefined"
    ) {
        return "";
    }

    return window.location.hostname;
}


function normalizeURL(url) {

    if (!url) {
        return "";
    }

    try {

        const parsed =
            new URL(url);

        parsed.hash = "";

        return parsed.toString();

    } catch (error) {

        return String(url)
            .trim();
    }
}


function getURLPath(url) {

    try {

        return new URL(
            url
        ).pathname;

    } catch (error) {

        return "";
    }
}


function getURLParameters(url) {

    try {

        const parsed =
            new URL(url);

        const result = {};

        parsed.searchParams.forEach(
            (value, key) => {

                result[key] = value;
            }
        );

        return result;

    } catch (error) {

        return {};
    }
}


function isHTTPURL(url) {

    try {

        const parsed =
            new URL(url);

        return (
            parsed.protocol ===
                "http:" ||
            parsed.protocol ===
                "https:"
        );

    } catch (error) {

        return false;
    }
}


function isHTTPSURL(url) {

    try {

        return new URL(
            url
        ).protocol === "https:";

    } catch (error) {

        return false;
    }
}


function getDomain(url) {

    try {

        return new URL(
            url
        ).hostname;

    } catch (error) {

        return "";
    }
}


function sameDomain(
    firstURL,
    secondURL
) {

    const first =
        getDomain(firstURL);

    const second =
        getDomain(secondURL);

    return (
        first !== "" &&
        first === second
    );
}


function removeHash(url) {

    try {

        const parsed =
            new URL(url);

        parsed.hash = "";

        return parsed.toString();

    } catch (error) {

        return String(url || "");
    }
}


if (typeof globalThis !== "undefined") {

    globalThis.getCurrentURL =
        getCurrentURL;

    globalThis.getCurrentOrigin =
        getCurrentOrigin;

    globalThis.getCurrentHostname =
        getCurrentHostname;

    globalThis.normalizeURL =
        normalizeURL;

    globalThis.getURLPath =
        getURLPath;

    globalThis.getURLParameters =
        getURLParameters;

    globalThis.isHTTPURL =
        isHTTPURL;

    globalThis.isHTTPSURL =
        isHTTPSURL;

    globalThis.getDomain =
        getDomain;

    globalThis.sameDomain =
        sameDomain;

    globalThis.removeHash =
        removeHash;
}