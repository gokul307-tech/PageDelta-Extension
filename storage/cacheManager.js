/*
 * PageDelta
 * Cache Manager
 */

async function setCache(
    key,
    value,
    ttl = 30 * 60 * 1000
) {

    if (!key) {
        return false;
    }


    const cache =
        await storageGet(
            PAGEDELTA_STORAGE.CACHE,
            {}
        );


    cache[key] = {

        value,

        createdAt:
            Date.now(),

        expiresAt:
            Date.now() + ttl
    };


    await storageSet(
        PAGEDELTA_STORAGE.CACHE,
        cache
    );


    return true;
}


async function getCache(
    key
) {

    if (!key) {
        return null;
    }


    const cache =
        await storageGet(
            PAGEDELTA_STORAGE.CACHE,
            {}
        );


    const item =
        cache[key];


    if (!item) {
        return null;
    }


    if (
        Date.now() >
        item.expiresAt
    ) {

        delete cache[key];


        await storageSet(
            PAGEDELTA_STORAGE.CACHE,
            cache
        );


        return null;
    }


    return item.value;
}


async function hasCache(
    key
) {

    const value =
        await getCache(key);

    return value !== null;
}


async function removeCache(
    key
) {

    if (!key) {
        return false;
    }


    const cache =
        await storageGet(
            PAGEDELTA_STORAGE.CACHE,
            {}
        );


    delete cache[key];


    await storageSet(
        PAGEDELTA_STORAGE.CACHE,
        cache
    );


    return true;
}


async function clearCache() {

    await storageRemove(
        PAGEDELTA_STORAGE.CACHE
    );

    return true;
}


function createCacheKey(
    url,
    type = "analysis"
) {

    return [
        "cache",
        type,
        createPageKey(url)
    ].join(":");
}


if (typeof globalThis !== "undefined") {

    globalThis.setCache =
        setCache;

    globalThis.getCache =
        getCache;

    globalThis.hasCache =
        hasCache;

    globalThis.removeCache =
        removeCache;

    globalThis.clearCache =
        clearCache;

    globalThis.createCacheKey =
        createCacheKey;
}