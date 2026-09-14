/*
 * PageDelta
 * Page Storage
 */

async function savePage(
    page
) {

    if (!page || !page.url) {
        return false;
    }

    const pages =
        await storageGet(
            PAGEDELTA_STORAGE.PAGES,
            {}
        );

    const key =
        createPageKey(
            page.url
        );


    pages[key] = {

        ...page,

        url:
            page.url,

        lastVisited:
            Date.now()
    };


    await storageSet(
        PAGEDELTA_STORAGE.PAGES,
        pages
    );


    return true;
}


async function getPage(
    url
) {

    if (!url) {
        return null;
    }

    const pages =
        await storageGet(
            PAGEDELTA_STORAGE.PAGES,
            {}
        );


    const key =
        createPageKey(url);


    return pages[key] || null;
}


async function getAllPages() {

    return await storageGet(
        PAGEDELTA_STORAGE.PAGES,
        {}
    );
}


async function deletePage(
    url
) {

    if (!url) {
        return false;
    }


    const pages =
        await getAllPages();


    const key =
        createPageKey(url);


    if (!pages[key]) {
        return false;
    }


    delete pages[key];


    await storageSet(
        PAGEDELTA_STORAGE.PAGES,
        pages
    );


    return true;
}


async function clearPages() {

    await storageRemove(
        PAGEDELTA_STORAGE.PAGES
    );

    return true;
}


function createPageKey(
    url
) {

    let hash = 0;

    const text =
        String(url);


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        hash =
            (
                (
                    hash << 5
                ) -
                hash
            ) +
            text.charCodeAt(i);

        hash |= 0;
    }


    return (
        "page_" +
        Math.abs(hash)
    );
}


function normalizePageData(
    analysis
) {

    if (!analysis) {
        return null;
    }


    return {

        url:
            analysis.url || "",

        title:
            analysis.title || "",

        hostname:
            analysis.metadata?.hostname ||
            getHostname(
                analysis.url
            ),

        lastAnalyzed:
            Date.now(),

        importance:
            analysis.importance || 0,

        importanceLevel:
            analysis.importanceLevel ||
            "low",

        deadlines:
            Array.isArray(
                analysis.deadlines
            )
                ? analysis.deadlines
                : [],

        requirements:
            Array.isArray(
                analysis.requirements
            )
                ? analysis.requirements
                : []
    };
}


function getHostname(
    url
) {

    try {

        return new URL(
            url
        ).hostname;

    } catch (error) {

        return "";
    }
}


if (typeof globalThis !== "undefined") {

    globalThis.savePage =
        savePage;

    globalThis.getPage =
        getPage;

    globalThis.getAllPages =
        getAllPages;

    globalThis.deletePage =
        deletePage;

    globalThis.clearPages =
        clearPages;

    globalThis.createPageKey =
        createPageKey;

    globalThis.normalizePageData =
        normalizePageData;
}