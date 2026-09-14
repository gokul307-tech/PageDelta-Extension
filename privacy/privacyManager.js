/*
 * PageDelta
 * Privacy Manager
 */

const PRIVACY_STATE = {

    ENABLED: "enabled",

    DISABLED: "disabled"
};


/*
 * Get current privacy configuration.
 */
async function getPrivacySettings() {

    const settings =
        await getSettings();


    return {

        privacyMode:
            settings.privacyMode !==
            false,

        storePageText:
            settings.storePageText !==
            false,

        storeSensitiveData:
            settings.storeSensitiveData ===
            true
    };
}


/*
 * Determine whether PageDelta
 * is allowed to store page text.
 */
async function canStorePageText() {

    const settings =
        await getPrivacySettings();


    return (
        settings.storePageText &&
        settings.privacyMode
    );
}


/*
 * Determine whether sensitive data
 * can be stored.
 */
async function canStoreSensitiveData() {

    const settings =
        await getPrivacySettings();


    return (
        settings.storeSensitiveData ===
        true
    );
}


/*
 * Prepare analysis before storage.
 */
async function prepareDataForStorage(
    data
) {

    if (!data) {
        return null;
    }


    const settings =
        await getPrivacySettings();


    const filtered =
        filterPageData(
            data,
            {
                redactText:
                    settings.privacyMode,

                removeSensitiveFields:
                    settings.privacyMode,

                removePasswords:
                    true
            }
        );


    /*
     * If the user doesn't want page text
     * stored, remove it completely.
     */
    if (
        !settings.storePageText
    ) {

        delete filtered.pageText;
    }


    /*
     * Sensitive data should never be
     * stored unless explicitly enabled.
     */
    if (
        !settings.storeSensitiveData
    ) {

        delete filtered.sensitiveData;
    }


    return filtered;
}


/*
 * Save an analysis safely.
 */
async function securelyStoreAnalysis(
    analysis
) {

    if (!analysis) {
        return false;
    }


    const safeData =
        await prepareDataForStorage(
            analysis
        );


    if (!safeData) {
        return false;
    }


    const page =
        normalizePageData(
            safeData
        );


    if (page) {

        await savePage(
            page
        );
    }


    return true;
}


/*
 * Completely remove stored data
 * belonging to a specific page.
 */
async function deletePageData(
    url
) {

    if (!url) {
        return false;
    }


    await deletePage(
        url
    );


    await deleteSnapshots(
        url
    );


    /*
     * Remove cached analysis for
     * this page if cache exists.
     */
    const cacheKey =
        createCacheKey(
            url,
            "analysis"
        );


    await removeCache(
        cacheKey
    );


    return true;
}


/*
 * Delete everything stored by PageDelta.
 */
async function deleteAllUserData() {

    await clearPageDeltaStorage();

    return true;
}


/*
 * Privacy status for UI.
 */
async function getPrivacyStatus() {

    const settings =
        await getPrivacySettings();


    return {

        enabled:
            settings.privacyMode,

        pageTextStored:
            settings.storePageText,

        sensitiveDataStored:
            settings.storeSensitiveData,

        status:
            settings.privacyMode
                ? PRIVACY_STATE.ENABLED
                : PRIVACY_STATE.DISABLED
    };
}


if (typeof globalThis !== "undefined") {

    globalThis.PRIVACY_STATE =
        PRIVACY_STATE;

    globalThis.getPrivacySettings =
        getPrivacySettings;

    globalThis.canStorePageText =
        canStorePageText;

    globalThis.canStoreSensitiveData =
        canStoreSensitiveData;

    globalThis.prepareDataForStorage =
        prepareDataForStorage;

    globalThis.securelyStoreAnalysis =
        securelyStoreAnalysis;

    globalThis.deletePageData =
        deletePageData;

    globalThis.deleteAllUserData =
        deleteAllUserData;

    globalThis.getPrivacyStatus =
        getPrivacyStatus;
}