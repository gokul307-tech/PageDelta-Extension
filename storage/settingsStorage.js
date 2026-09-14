/*
 * PageDelta
 * Settings Storage
 */

const DEFAULT_SETTINGS = {

    enabled: true,

    autoAnalyze: true,

    autoDetectChanges: true,

    showFloatingPanel: true,

    notifications: true,

    notificationImportance:
        "medium",

    maxSnapshotsPerPage: 10,

    cacheDurationMinutes: 30,

    privacyMode: true,

    storePageText: true,

    storeSensitiveData: false
};


async function getSettings() {

    const settings =
        await storageGet(
            PAGEDELTA_STORAGE.SETTINGS,
            {}
        );


    return {

        ...DEFAULT_SETTINGS,

        ...settings
    };
}


async function saveSettings(
    settings
) {

    if (!settings) {
        return false;
    }


    const current =
        await getSettings();


    const updated = {

        ...current,

        ...settings
    };


    await storageSet(
        PAGEDELTA_STORAGE.SETTINGS,
        updated
    );


    return true;
}


async function updateSetting(
    key,
    value
) {

    if (!key) {
        return false;
    }


    const settings =
        await getSettings();


    settings[key] =
        value;


    await storageSet(
        PAGEDELTA_STORAGE.SETTINGS,
        settings
    );


    return true;
}


async function resetSettings() {

    await storageSet(
        PAGEDELTA_STORAGE.SETTINGS,
        {
            ...DEFAULT_SETTINGS
        }
    );


    return true;
}


async function getSetting(
    key
) {

    const settings =
        await getSettings();


    return settings[key];
}


if (typeof globalThis !== "undefined") {

    globalThis.DEFAULT_SETTINGS =
        DEFAULT_SETTINGS;

    globalThis.getSettings =
        getSettings;

    globalThis.saveSettings =
        saveSettings;

    globalThis.updateSetting =
        updateSetting;

    globalThis.resetSettings =
        resetSettings;

    globalThis.getSetting =
        getSetting;
}