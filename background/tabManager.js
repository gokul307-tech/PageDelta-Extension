/*
 * PageDelta
 * Tab Manager
 */

const pageDeltaTabs = new Map();


async function registerTab(tab) {

    if (!tab || !tab.id) {
        return false;
    }

    pageDeltaTabs.set(tab.id, {
        id: tab.id,
        url: tab.url || "",
        title: tab.title || "",
        active: Boolean(tab.active),
        windowId: tab.windowId,
        lastUpdated: Date.now()
    });

    return true;
}


async function updateTab(tabId, changes) {

    if (!tabId) {
        return false;
    }

    const existing =
        pageDeltaTabs.get(tabId) || {
            id: tabId
        };

    pageDeltaTabs.set(tabId, {
        ...existing,
        ...changes,
        lastUpdated: Date.now()
    });

    return true;
}


function removeTab(tabId) {

    if (!tabId) {
        return false;
    }

    return pageDeltaTabs.delete(tabId);
}


function getTab(tabId) {

    return pageDeltaTabs.get(tabId) || null;
}


function getAllTabs() {

    return Array.from(
        pageDeltaTabs.values()
    );
}


async function getActiveTab() {

    const tabs =
        await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

    if (!tabs.length) {
        return null;
    }

    return tabs[0];
}


async function sendMessageToTab(
    tabId,
    message
) {

    if (!tabId || !message) {
        return false;
    }

    try {

        await chrome.tabs.sendMessage(
            tabId,
            message
        );

        return true;

    } catch (error) {

        console.warn(
            "[PageDelta] Could not send message to tab:",
            error
        );

        return false;
    }
}


async function sendMessageToActiveTab(
    message
) {

    const tab =
        await getActiveTab();

    if (!tab || !tab.id) {
        return false;
    }

    return sendMessageToTab(
        tab.id,
        message
    );
}


function isSupportedPage(url) {

    if (!url) {
        return false;
    }

    return !(
        url.startsWith("chrome://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("edge://") ||
        url.startsWith("about:") ||
        url.startsWith("file://")
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.registerTab =
        registerTab;

    globalThis.updateTab =
        updateTab;

    globalThis.removeTab =
        removeTab;

    globalThis.getTab =
        getTab;

    globalThis.getAllTabs =
        getAllTabs;

    globalThis.getActiveTab =
        getActiveTab;

    globalThis.sendMessageToTab =
        sendMessageToTab;

    globalThis.sendMessageToActiveTab =
        sendMessageToActiveTab;

    globalThis.isSupportedPage =
        isSupportedPage;
}