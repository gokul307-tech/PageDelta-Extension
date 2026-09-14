/*
 * PageDelta
 * Storage Manager
 *
 * Central storage interface for the extension.
 */

const PAGEDELTA_STORAGE = {
    PAGES: "pagedelta_pages",
    SNAPSHOTS: "pagedelta_snapshots",
    ACTIONS: "pagedelta_actions",
    SETTINGS: "pagedelta_settings",
    CACHE: "pagedelta_cache"
};


/*
 * Save a value.
 */
async function storageSet(
    key,
    value
) {

    if (!key) {
        throw new Error(
            "Storage key is required."
        );
    }

    await chrome.storage.local.set({
        [key]: value
    });

    return true;
}


/*
 * Get a value.
 */
async function storageGet(
    key,
    defaultValue = null
) {

    if (!key) {
        return defaultValue;
    }

    const result =
        await chrome.storage.local.get(
            key
        );

    if (
        result[key] === undefined
    ) {
        return defaultValue;
    }

    return result[key];
}


/*
 * Remove a value.
 */
async function storageRemove(
    key
) {

    if (!key) {
        return false;
    }

    await chrome.storage.local.remove(
        key
    );

    return true;
}


/*
 * Clear ALL PageDelta data.
 */
async function clearPageDeltaStorage() {

    await chrome.storage.local.clear();

    return true;
}


/*
 * Get the complete PageDelta storage.
 */
async function getAllStorage() {

    return await chrome.storage.local.get(
        null
    );
}


/*
 * Calculate approximate storage usage.
 */
async function getStorageUsage() {

    const data =
        await getAllStorage();

    let bytes = 0;

    try {

        bytes =
            new Blob([
                JSON.stringify(data)
            ]).size;

    } catch (error) {

        bytes =
            JSON.stringify(data).length;
    }

    return {
        bytes,
        kilobytes:
            Math.round(
                bytes / 1024
            ),
        megabytes:
            Number(
                (
                    bytes /
                    (1024 * 1024)
                ).toFixed(2)
            )
    };
}


if (typeof globalThis !== "undefined") {

    globalThis.PAGEDELTA_STORAGE =
        PAGEDELTA_STORAGE;

    globalThis.storageSet =
        storageSet;

    globalThis.storageGet =
        storageGet;

    globalThis.storageRemove =
        storageRemove;

    globalThis.clearPageDeltaStorage =
        clearPageDeltaStorage;

    globalThis.getAllStorage =
        getAllStorage;

    globalThis.getStorageUsage =
        getStorageUsage;
}