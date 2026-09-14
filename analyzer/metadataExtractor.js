/*
 * PageDelta
 * Metadata Extraction
 */

function extractMetadata() {

    const metadata = {

        title:
            document.title || "",

        url:
            window.location.href,

        hostname:
            window.location.hostname,

        description:
            getMetaContent(
                "description"
            ),

        keywords:
            getMetaContent(
                "keywords"
            ),

        author:
            getMetaContent(
                "author"
            ),

        language:
            document.documentElement
                ?.getAttribute("lang") || "",

        canonical:
            getCanonicalURL(),

        ogTitle:
            getMetaContent(
                "og:title"
            ),

        ogDescription:
            getMetaContent(
                "og:description"
            ),

        ogType:
            getMetaContent(
                "og:type"
            )
    };


    return metadata;
}


function getMetaContent(
    name
) {

    if (!name) {
        return "";
    }


    const meta =
        document.querySelector(
            `meta[name="${CSS.escape(name)}"], meta[property="${CSS.escape(name)}"]`
        );


    return (
        meta?.getAttribute("content") ||
        ""
    ).trim();
}


function getCanonicalURL() {

    const canonical =
        document.querySelector(
            'link[rel="canonical"]'
        );

    return (
        canonical?.href ||
        ""
    );
}


function extractMetaTags() {

    const tags =
        document.querySelectorAll(
            "meta"
        );

    return Array.from(tags)
        .map(meta => ({

            name:
                meta.getAttribute("name") ||
                meta.getAttribute("property") ||
                "",

            content:
                meta.getAttribute("content") ||
                ""
        }))
        .filter(
            item =>
                item.name &&
                item.content
        );
}


if (typeof globalThis !== "undefined") {

    globalThis.extractMetadata =
        extractMetadata;

    globalThis.getMetaContent =
        getMetaContent;

    globalThis.getCanonicalURL =
        getCanonicalURL;

    globalThis.extractMetaTags =
        extractMetaTags;
}