/*
 * PageDelta
 * Background Service Worker
 *
 * Main controller for the extension.
 */

"use strict";


/* =========================================================
   LOAD REQUIRED MODULES
   ========================================================= */

importScripts(

    /* Utilities */
    "../utils/constants.js",

    /* Storage */
    "../storage/storageManager.js",
    "../storage/pageStorage.js",
    "../storage/snapshotStorage.js",
    "../storage/actionStorage.js",
    "../storage/settingsStorage.js",
    "../storage/cacheManager.js",

    /* Actions */
    "../actions/actionStatus.js",
    "../actions/actionHistory.js",
    "../actions/reminderManager.js",
    "../actions/actionManager.js",

    /* Privacy */
    "../privacy/sensitiveDataDetector.js",
    "../privacy/dataFilter.js",
    "../privacy/privacyManager.js",

    /* Background modules */
    "tabManager.js",
    "notificationManager.js",
    "scheduler.js"
);


console.log(
    "[PageDelta] Background service worker loaded."
);


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const PAGEDELTA_BACKGROUND = {

    initialized: false,

    startedAt: Date.now(),

    version: "1.0.0",

    processedPages: 0,

    lastAnalysisTime: null
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initializeBackground() {

    if (
        PAGEDELTA_BACKGROUND.initialized
    ) {

        return;
    }


    console.log(
        "[PageDelta] Initializing background service..."
    );


    try {

        /*
         * Initialize default settings.
         */
        await initializeDefaultSettings();


        /*
         * Initialize currently
         * open browser tabs.
         */
        await initializeExistingTabs();


        /*
         * Initialize scheduler.
         */
        await initializeScheduler();


        PAGEDELTA_BACKGROUND.initialized =
            true;


        console.log(
            "[PageDelta] Background service initialized."
        );


    } catch (error) {

        console.error(
            "[PageDelta] Initialization failed:",
            error
        );
    }
}


/* =========================================================
   INSTALLATION
   ========================================================= */

chrome.runtime.onInstalled.addListener(
    async details => {

        console.log(
            "[PageDelta] onInstalled:",
            details.reason
        );


        try {

            if (
                details.reason ===
                "install"
            ) {

                await initializeDefaultSettings();


                /*
                 * Create initial extension
                 * storage.
                 */
                await initializeStorage();
            }


            if (
                details.reason ===
                "update"
            ) {

                console.log(
                    "[PageDelta] Extension updated."
                );
            }


            await initializeBackground();


        } catch (error) {

            console.error(
                "[PageDelta] Installation handler failed:",
                error
            );
        }
    }
);


/* =========================================================
   BROWSER STARTUP
   ========================================================= */

chrome.runtime.onStartup.addListener(
    async () => {

        console.log(
            "[PageDelta] Browser startup detected."
        );


        await initializeBackground();
    }
);


/* =========================================================
   START IMMEDIATELY
   ========================================================= */

initializeBackground();


/* =========================================================
   TAB EVENTS
   ========================================================= */


/*
 * New tab.
 */
chrome.tabs.onCreated.addListener(
    async tab => {

        try {

            await registerTab(
                tab
            );

        } catch (error) {

            console.error(
                "[PageDelta] Tab registration failed:",
                error
            );
        }
    }
);


/*
 * Tab updated.
 */
chrome.tabs.onUpdated.addListener(
    async (
        tabId,
        changeInfo,
        tab
    ) => {

        try {

            await updateTab(
                tabId,
                {

                    url:
                        tab.url ||
                        "",

                    title:
                        tab.title ||
                        "",

                    status:
                        changeInfo.status ||
                        "",

                    active:
                        Boolean(
                            tab.active
                        ),

                    windowId:
                        tab.windowId
                }
            );


            /*
             * If a page has finished loading,
             * notify the content script.
             */
            if (
                changeInfo.status ===
                "complete"
            ) {

                if (
                    isSupportedPage(
                        tab.url
                    )
                ) {

                    /*
                     * Small delay gives the
                     * webpage time to finish
                     * rendering dynamic content.
                     */
                    setTimeout(
                        async () => {

                            try {

                                await chrome.tabs.sendMessage(
                                    tabId,
                                    {
                                        type:
                                            "PAGE_READY"
                                    }
                                );

                            } catch (error) {

                                /*
                                 * This is normal for
                                 * unsupported pages.
                                 */
                            }

                        },
                        500
                    );
                }
            }

        } catch (error) {

            console.error(
                "[PageDelta] Tab update failed:",
                error
            );
        }
    }
);


/*
 * Tab removed.
 */
chrome.tabs.onRemoved.addListener(
    tabId => {

        try {

            removeTab(
                tabId
            );

        } catch (error) {

            console.error(
                "[PageDelta] Tab removal failed:",
                error
            );
        }
    }
);


/*
 * Active tab changed.
 */
chrome.tabs.onActivated.addListener(
    async activeInfo => {

        try {

            const tabs =
                getAllTabs();


            for (
                const tab
                of tabs
            ) {

                await updateTab(
                    tab.id,
                    {
                        active:
                            tab.id ===
                            activeInfo.tabId
                    }
                );
            }

        } catch (error) {

            console.error(
                "[PageDelta] Active tab update failed:",
                error
            );
        }
    }
);


/* =========================================================
   ALARM EVENTS
   ========================================================= */

chrome.alarms.onAlarm.addListener(
    async alarm => {

        try {

            await handleScheduledTask(
                alarm
            );

        } catch (error) {

            console.error(
                "[PageDelta] Scheduled task failed:",
                error
            );
        }
    }
);


/* =========================================================
   NOTIFICATION EVENTS
   ========================================================= */

chrome.notifications.onClicked.addListener(
    async notificationId => {

        console.log(
            "[PageDelta] Notification clicked:",
            notificationId
        );


        /*
         * Currently just open the
         * extension dashboard.
         */
        try {

            if (
                notificationId.includes(
                    "pagedelta"
                )
            ) {

                await openDashboard();
            }

        } catch (error) {

            console.error(
                "[PageDelta] Notification click failed:",
                error
            );
        }
    }
);


/* =========================================================
   MESSAGE HANDLER
   ========================================================= */

chrome.runtime.onMessage.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {

        /*
         * Validate message.
         */
        if (!message) {

            sendResponse({

                success: false,

                error:
                    "Empty message."
            });

            return false;
        }


        /*
         * Process asynchronously.
         */
        handleMessage(
            message,
            sender
        )
            .then(
                result => {

                    sendResponse({

                        success: true,

                        data:
                            result
                    });
                }
            )
            .catch(
                error => {

                    console.error(
                        "[PageDelta] Message handler error:",
                        error
                    );


                    sendResponse({

                        success: false,

                        error:
                            error.message ||
                            "Unknown error."
                    });
                }
            );


        /*
         * Keep message channel alive.
         */
        return true;
    }
);


/* =========================================================
   MESSAGE ROUTER
   ========================================================= */

async function handleMessage(
    message,
    sender
) {

    switch (
        message.type
    ) {


        /* ---------------------------------------------
           Ping
        --------------------------------------------- */

        case "PING":

            return {

                message:
                    "PageDelta background is active.",

                version:
                    PAGEDELTA_BACKGROUND.version,

                uptime:
                    Date.now() -
                    PAGEDELTA_BACKGROUND.startedAt
            };


        /* ---------------------------------------------
           Page analyzed
        --------------------------------------------- */

        case "PAGE_ANALYZED":

            return await handlePageAnalyzed(
                message.data,
                sender
            );


        /* ---------------------------------------------
           Analyze active tab
        --------------------------------------------- */

        case "ANALYZE_ACTIVE_TAB":

            return await analyzeActiveTab();


        /* ---------------------------------------------
           Get active tab
        --------------------------------------------- */

        case "GET_ACTIVE_TAB":

            return await getActiveTab();


        /* ---------------------------------------------
           Show floating panel
        --------------------------------------------- */

        case "SHOW_PANEL":

            return await sendMessageToActiveTab({

                type:
                    "SHOW_PANEL"
            });


        /* ---------------------------------------------
           Hide floating panel
        --------------------------------------------- */

        case "HIDE_PANEL":

            return await sendMessageToActiveTab({

                type:
                    "HIDE_PANEL"
            });


        /* ---------------------------------------------
           Toggle floating panel
        --------------------------------------------- */

        case "TOGGLE_PANEL":

            return await sendMessageToActiveTab({

                type:
                    "TOGGLE_PANEL"
            });


        /* ---------------------------------------------
           Get page analysis
        --------------------------------------------- */

        case "GET_PAGE_ANALYSIS":

            return await getPageAnalysis(
                message.tabId
            );


        /* ---------------------------------------------
           Get settings
        --------------------------------------------- */

        case "GET_SETTINGS":

            return await getSettings();


        /* ---------------------------------------------
           Save settings
        --------------------------------------------- */

        case "SAVE_SETTINGS":

            return await handleSaveSettings(
                message.settings
            );


        /* ---------------------------------------------
           Get actions
        --------------------------------------------- */

        case "GET_ACTIONS":

            return await getActions(
                message.options || {}
            );


        /* ---------------------------------------------
           Create action
        --------------------------------------------- */

        case "CREATE_ACTION":

            return await createAction(
                message.action
            );


        /* ---------------------------------------------
           Complete action
        --------------------------------------------- */

        case "COMPLETE_ACTION":

            return await completeAction(
                message.actionId
            );


        /* ---------------------------------------------
           Dismiss action
        --------------------------------------------- */

        case "DISMISS_ACTION":

            return await dismissAction(
                message.actionId
            );


        /* ---------------------------------------------
           Create reminder
        --------------------------------------------- */

        case "CREATE_REMINDER":

            return await createReminder(
                message.reminder
            );


        /* ---------------------------------------------
           Get reminders
        --------------------------------------------- */

        case "GET_REMINDERS":

            return await getReminders();


        /* ---------------------------------------------
           Delete reminder
        --------------------------------------------- */

        case "DELETE_REMINDER":

            return await deleteReminder(
                message.reminderId
            );


        /* ---------------------------------------------
           Get page
        --------------------------------------------- */

        case "GET_PAGE":

            return await getStoredPage(
                message.url
            );


        /* ---------------------------------------------
           Save page
        --------------------------------------------- */

        case "SAVE_PAGE":

            return await savePage(
                message.page
            );


        /* ---------------------------------------------
           Get snapshots
        --------------------------------------------- */

        case "GET_SNAPSHOTS":

            return await getSnapshots(
                message.url
            );


        /* ---------------------------------------------
           Get history
        --------------------------------------------- */

        case "GET_ACTION_HISTORY":

            return await getActionHistory(
                message.options || {}
            );


        /* ---------------------------------------------
           Privacy status
        --------------------------------------------- */

        case "GET_PRIVACY_STATUS":

            return await getPrivacyStatus();


        /* ---------------------------------------------
           Delete all data
        --------------------------------------------- */

        case "DELETE_ALL_DATA":

            return await deleteAllUserData();


        /* ---------------------------------------------
           Clear cache
        --------------------------------------------- */

        case "CLEAR_CACHE":

            return await clearAllCache();


        /* ---------------------------------------------
           Open dashboard
        --------------------------------------------- */

        case "OPEN_DASHBOARD":

            return await openDashboard();


        /* ---------------------------------------------
           Open settings
        --------------------------------------------- */

        case "OPEN_SETTINGS":

            return await openSettings();


        /* ---------------------------------------------
           Unknown message
        --------------------------------------------- */

        default:

            console.warn(
                "[PageDelta] Unknown message:",
                message.type
            );


            return {

                handled: false,

                message:
                    `Unknown message type: ${message.type}`
            };
    }
}


/* =========================================================
   PAGE ANALYSIS
   ========================================================= */

async function handlePageAnalyzed(
    analysis,
    sender
) {

    if (!analysis) {

        throw new Error(
            "No page analysis received."
        );
    }


    const tab =
        sender?.tab || null;


    const url =
        analysis.url ||
        tab?.url ||
        "";


    /*
     * Register sender tab.
     */
    if (tab) {

        await registerTab(
            tab
        );
    }


    /*
     * Add metadata.
     */
    const enrichedAnalysis = {

        ...analysis,

        url,

        tabId:
            tab?.id || null,

        analyzedAt:
            Date.now()
    };


    /*
     * Store page analysis.
     */
    await securelyStoreAnalysis(
        enrichedAnalysis
    );


    PAGEDELTA_BACKGROUND.processedPages++;

    PAGEDELTA_BACKGROUND.lastAnalysisTime =
        Date.now();


    /*
     * Process deadlines.
     */
    await processDetectedDeadlines(
        enrichedAnalysis
    );


    /*
     * Process detected actions.
     */
    await processDetectedActions(
        enrichedAnalysis
    );


    /*
     * Process important changes.
     */
    await processDetectedChanges(
        enrichedAnalysis
    );


    return {

        stored: true,

        url,

        analyzedAt:
            enrichedAnalysis.analyzedAt
    };
}


/* =========================================================
   STORE ANALYSIS
   ========================================================= */

async function securelyStoreAnalysis(
    analysis
) {

    try {

        /*
         * Privacy filter if available.
         */
        let safeAnalysis =
            analysis;


        if (
            typeof filterSensitiveData ===
            "function"
        ) {

            safeAnalysis =
                filterSensitiveData(
                    analysis
                );
        }


        /*
         * Save page.
         */
        if (
            typeof savePage ===
            "function"
        ) {

            await savePage({

                url:
                    safeAnalysis.url,

                title:
                    safeAnalysis.title ||
                    "",

                analysis:
                    safeAnalysis,

                updatedAt:
                    Date.now()
            });
        }


        return true;

    } catch (error) {

        console.error(
            "[PageDelta] Could not store analysis:",
            error
        );

        return false;
    }
}


/* =========================================================
   DEADLINE PROCESSING
   ========================================================= */

async function processDetectedDeadlines(
    analysis
) {

    if (
        !Array.isArray(
            analysis.deadlines
        )
    ) {

        return;
    }


    for (
        const deadline
        of analysis.deadlines
    ) {

        try {

            const action = {

                type:
                    "deadline",

                title:
                    deadline.title ||
                    deadline.text ||
                    "Detected deadline",

                description:
                    deadline.description ||
                    deadline.text ||
                    "",

                url:
                    analysis.url,

                deadline:
                    deadline.date ||
                    deadline.deadline ||
                    null,

                importance:
                    deadline.importance ||
                    "high",

                source:
                    "PageDelta"
            };


            /*
             * Don't create duplicate
             * actions where possible.
             */
            const existing =
                await findExistingAction(
                    action
                );


            if (!existing) {

                await createAction(
                    action
                );
            }


        } catch (error) {

            console.error(
                "[PageDelta] Deadline processing failed:",
                error
            );
        }
    }
}


/* =========================================================
   ACTION PROCESSING
   ========================================================= */

async function processDetectedActions(
    analysis
) {

    if (
        !Array.isArray(
            analysis.actions
        )
    ) {

        return;
    }


    for (
        const detectedAction
        of analysis.actions
    ) {

        try {

            const action = {

                type:
                    detectedAction.type ||
                    "general",

                title:
                    detectedAction.title ||
                    detectedAction.text ||
                    "Detected action",

                description:
                    detectedAction.description ||
                    detectedAction.text ||
                    "",

                url:
                    analysis.url,

                importance:
                    detectedAction.importance ||
                    "medium",

                source:
                    "PageDelta"
            };


            const existing =
                await findExistingAction(
                    action
                );


            if (!existing) {

                await createAction(
                    action
                );
            }

        } catch (error) {

            console.error(
                "[PageDelta] Action processing failed:",
                error
            );
        }
    }
}


/* =========================================================
   CHANGE PROCESSING
   ========================================================= */

async function processDetectedChanges(
    analysis
) {

    if (
        !analysis.changes
    ) {

        return;
    }


    const importance =
        analysis.changes.importance ||
        analysis.changes.level ||
        "low";


    if (
        importance ===
        "high"
    ) {

        try {

            await notifyImportantChange({

                summary:
                    analysis.changes.summary ||
                    "PageDelta detected an important change."
            });

        } catch (error) {

            console.error(
                "[PageDelta] Change notification failed:",
                error
            );
        }
    }
}


/* =========================================================
   ACTIVE TAB ANALYSIS
   ========================================================= */

async function analyzeActiveTab() {

    const tab =
        await getActiveTab();


    if (!tab || !tab.id) {

        throw new Error(
            "No active tab found."
        );
    }


    if (
        !isSupportedPage(
            tab.url
        )
    ) {

        throw new Error(
            "This page cannot be analyzed by PageDelta."
        );
    }


    try {

        await chrome.tabs.sendMessage(
            tab.id,
            {
                type:
                    "ANALYZE_PAGE"
            }
        );


        return {

            sent: true,

            tabId:
                tab.id,

            url:
                tab.url
        };

    } catch (error) {

        throw new Error(
            "PageDelta is not available on this page."
        );
    }
}


/* =========================================================
   GET PAGE ANALYSIS
   ========================================================= */

async function getPageAnalysis(
    tabId
) {

    let targetTab;


    if (tabId) {

        targetTab =
            await chrome.tabs.get(
                tabId
            );

    } else {

        targetTab =
            await getActiveTab();
    }


    if (
        !targetTab ||
        !targetTab.id
    ) {

        return null;
    }


    try {

        const response =
            await chrome.tabs.sendMessage(
                targetTab.id,
                {
                    type:
                        "GET_PAGE_ANALYSIS"
                }
            );


        return response;

    } catch (error) {

        return null;
    }
}


/* =========================================================
   SETTINGS
   ========================================================= */

async function handleSaveSettings(
    settings
) {

    if (!settings) {

        throw new Error(
            "No settings supplied."
        );
    }


    await saveSettings(
        settings
    );


    return await getSettings();
}


/* =========================================================
   STORAGE INITIALIZATION
   ========================================================= */

async function initializeStorage() {

    try {

        if (
            typeof initializeStorageManager ===
            "function"
        ) {

            await initializeStorageManager();
        }

    } catch (error) {

        console.warn(
            "[PageDelta] Storage initialization skipped:",
            error
        );
    }
}


/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

async function initializeDefaultSettings() {

    try {

        const existing =
            await getSettings();


        if (
            !existing ||
            Object.keys(existing).length ===
            0
        ) {

            if (
                typeof DEFAULT_SETTINGS !==
                "undefined"
            ) {

                await saveSettings(
                    DEFAULT_SETTINGS
                );

            } else {

                await saveSettings({

                    notifications:
                        true,

                    autoAnalyze:
                        true,

                    saveHistory:
                        true,

                    privacyMode:
                        true,

                    autoDetectActions:
                        true,

                    autoDetectDeadlines:
                        true
                });
            }
        }

    } catch (error) {

        console.error(
            "[PageDelta] Default settings initialization failed:",
            error
        );
    }
}


/* =========================================================
   EXISTING TABS
   ========================================================= */

async function initializeExistingTabs() {

    try {

        const tabs =
            await chrome.tabs.query({});


        for (
            const tab
            of tabs
        ) {

            await registerTab(
                tab
            );
        }


        console.log(
            `[PageDelta] Registered ${tabs.length} tabs.`
        );

    } catch (error) {

        console.error(
            "[PageDelta] Existing tab initialization failed:",
            error
        );
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function openDashboard() {

    const dashboardUrl =
        chrome.runtime.getURL(
            "dashboard/dashboard.html"
        );


    const tabs =
        await chrome.tabs.query({});


    const existingTab =
        tabs.find(
            tab =>
                tab.url ===
                dashboardUrl
        );


    if (existingTab?.id) {

        await chrome.tabs.update(
            existingTab.id,
            {
                active: true
            }
        );


        if (
            existingTab.windowId
        ) {

            await chrome.windows.update(
                existingTab.windowId,
                {
                    focused: true
                }
            );
        }


        return existingTab;
    }


    return await chrome.tabs.create({

        url:
            dashboardUrl
    });
}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

async function openSettings() {

    const settingsUrl =
        chrome.runtime.getURL(
            "settings/settings.html"
        );


    return await chrome.tabs.create({

        url:
            settingsUrl
    });
}


/* =========================================================
   CACHE
   ========================================================= */

async function clearAllCache() {

    try {

        if (
            typeof clearCache ===
            "function"
        ) {

            await clearCache();

            return true;
        }


        /*
         * Fallback.
         */
        await chrome.storage.local.remove(
            "pagedelta_cache"
        );


        return true;

    } catch (error) {

        console.error(
            "[PageDelta] Cache clear failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   DELETE ALL USER DATA
   ========================================================= */

async function deleteAllUserData() {

    try {

        /*
         * Give privacy manager
         * first priority.
         */
        if (
            typeof deleteAllPrivacyData ===
            "function"
        ) {

            await deleteAllPrivacyData();

        } else {

            await chrome.storage.local.clear();

            await chrome.storage.session.clear();
        }


        /*
         * Re-create default settings.
         */
        await initializeDefaultSettings();


        return {

            success: true,

            message:
                "All PageDelta data has been deleted."
        };

    } catch (error) {

        console.error(
            "[PageDelta] Data deletion failed:",
            error
        );


        throw error;
    }
}


/* =========================================================
   SAFE ACTION LOOKUP
   ========================================================= */

async function findExistingAction(
    newAction
) {

    try {

        const actions =
            await getActions({

                url:
                    newAction.url,

                includeCompleted:
                    true
            });


        if (
            !Array.isArray(actions)
        ) {

            return null;
        }


        return (
            actions.find(
                action =>

                    action.title ===
                    newAction.title &&

                    action.url ===
                    newAction.url
            ) ||
            null
        );

    } catch (error) {

        return null;
    }
}


/* =========================================================
   REMINDER HELPERS
   ========================================================= */

async function getDueReminders() {

    if (
        typeof getReminders !==
        "function"
    ) {

        return [];
    }


    const reminders =
        await getReminders();


    if (
        !Array.isArray(
            reminders
        )
    ) {

        return [];
    }


    const now =
        Date.now();


    return reminders.filter(
        reminder => {

            if (
                reminder.completed ||
                reminder.triggered
            ) {

                return false;
            }


            const reminderTime =
                new Date(
                    reminder.time ||
                    reminder.dueAt ||
                    reminder.date
                ).getTime();


            return (
                Number.isFinite(
                    reminderTime
                ) &&
                reminderTime <=
                now
            );
        }
    );
}


/* =========================================================
   SERVICE WORKER STATUS
   ========================================================= */

function getBackgroundStatus() {

    return {

        initialized:
            PAGEDELTA_BACKGROUND.initialized,

        version:
            PAGEDELTA_BACKGROUND.version,

        startedAt:
            PAGEDELTA_BACKGROUND.startedAt,

        uptime:
            Date.now() -
            PAGEDELTA_BACKGROUND.startedAt,

        processedPages:
            PAGEDELTA_BACKGROUND.processedPages,

        lastAnalysisTime:
            PAGEDELTA_BACKGROUND.lastAnalysisTime,

        tabs:
            typeof getAllTabs ===
            "function"
                ? getAllTabs().length
                : 0
    };
}


console.log(
    "[PageDelta] Background service worker ready."
);