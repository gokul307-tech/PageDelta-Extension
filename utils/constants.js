/*
 * PageDelta
 * Global Constants
 */

(function () {
    "use strict";

    const PAGEDELTA = {

        VERSION: "1.0.0",

        NAME: "PageDelta",

        LIMITS: {
            MAX_TEXT_LENGTH: 50000,
            MAX_VISIBLE_ELEMENTS: 1000,
            MAX_HEADING_COUNT: 100,
            MAX_ANALYSIS_LENGTH: 30000,
            MAX_HISTORY_ITEMS: 100
        },

        ANALYSIS: {
            MIN_TEXT_LENGTH: 2,
            MIN_IMPORTANCE_SCORE: 0,
            MAX_IMPORTANCE_SCORE: 100
        },

        CHANGE_TYPES: {
            DOM_CHANGE: "dom-change",
            TEXT_CHANGE: "text-change",
            ELEMENT_ADDED: "element-added",
            ELEMENT_REMOVED: "element-removed",
            ATTRIBUTE_CHANGE: "attribute-change"
        },

        IMPORTANCE: {
            LOW: "low",
            MEDIUM: "medium",
            HIGH: "high",
            CRITICAL: "critical"
        },

        ACTION_STATUS: {
            PENDING: "pending",
            COMPLETED: "completed",
            DISMISSED: "dismissed",
            EXPIRED: "expired"
        },

        STORAGE_KEYS: {
            SETTINGS: "pagedelta_settings",
            PAGES: "pagedelta_pages",
            SNAPSHOTS: "pagedelta_snapshots",
            ACTIONS: "pagedelta_actions",
            HISTORY: "pagedelta_history",
            CACHE: "pagedelta_cache"
        },

        EVENTS: {
            PAGE_ANALYZED: "PAGE_ANALYZED",
            PAGE_CHANGED: "PAGE_CHANGED",
            ACTION_CREATED: "ACTION_CREATED",
            ACTION_UPDATED: "ACTION_UPDATED",
            SETTINGS_CHANGED: "SETTINGS_CHANGED"
        }

    };

    globalThis.PAGEDELTA = PAGEDELTA;

})();