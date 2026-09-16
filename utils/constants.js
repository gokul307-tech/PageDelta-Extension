/*
 * PageDelta
 * Global Constants
 *
 * Foundation configuration shared by all PageDelta
 * content-side modules.
 */

(function () {
    "use strict";

    const PAGEDELTA = {

        VERSION: "1.0.0",

        NAME: "PageDelta",

        LIMITS: {

            /*
             * Page text limits.
             */
            MAX_TEXT_LENGTH: 50000,

            MAX_ANALYSIS_LENGTH: 30000,

            MAX_ELEMENT_TEXT_LENGTH: 500,

            /*
             * DOM extraction limits.
             */
            MAX_VISIBLE_ELEMENTS: 1000,

            MAX_HEADING_COUNT: 100,

            /*
             * Keep the compatibility name used
             * by textExtractor.js.
             */
            MAX_HEADINGS: 100,

            /*
             * Form/action limits.
             */
            MAX_FIELDS: 200,

            MAX_ACTIONS: 100,

            MAX_BUTTONS: 200,

            /*
             * Other extraction limits.
             */
            MAX_DATES: 100,

            MAX_DEADLINES: 100,

            MAX_PRICES: 100,

            MAX_REQUIREMENTS: 100,

            MAX_CONTACTS: 100,

            MAX_KEYWORDS: 200,

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

            CACHE: "pagedelta_cache",

            /*
             * New product-layer storage keys.
             *
             * These are added now so later stages
             * have a stable storage contract.
             */
            PROFILE: "pagedelta_profile",

            PURPOSES: "pagedelta_purposes",

            DEADLINES: "pagedelta_deadlines",

            TRACKED_WEBSITES: "pagedelta_tracked_websites",

            PAGE_INTENT: "pagedelta_page_intent"
        },


        EVENTS: {

            PAGE_ANALYZED: "PAGE_ANALYZED",

            PAGE_CHANGED: "PAGE_CHANGED",

            ACTION_CREATED: "ACTION_CREATED",

            ACTION_UPDATED: "ACTION_UPDATED",

            SETTINGS_CHANGED: "SETTINGS_CHANGED",

            /*
             * Product-layer events.
             */
            PURPOSE_DETECTED: "PURPOSE_DETECTED",

            PURPOSE_CONFIRMED: "PURPOSE_CONFIRMED",

            PURPOSE_CORRECTED: "PURPOSE_CORRECTED",

            PROFILE_UPDATED: "PROFILE_UPDATED",

            FORM_PERMISSION_REQUESTED: "FORM_PERMISSION_REQUESTED",

            FORM_FILLED: "FORM_FILLED",

            DEADLINE_DETECTED: "DEADLINE_DETECTED",

            DEADLINE_UPDATED: "DEADLINE_UPDATED",

            WEBSITE_TRACKED: "WEBSITE_TRACKED"
        }

    };


    /*
     * Freeze nested configuration objects where possible.
     *
     * This prevents accidental runtime changes to
     * important limits and event names.
     */
    try {

        Object.freeze(PAGEDELTA.LIMITS);
        Object.freeze(PAGEDELTA.ANALYSIS);
        Object.freeze(PAGEDELTA.CHANGE_TYPES);
        Object.freeze(PAGEDELTA.IMPORTANCE);
        Object.freeze(PAGEDELTA.ACTION_STATUS);
        Object.freeze(PAGEDELTA.STORAGE_KEYS);
        Object.freeze(PAGEDELTA.EVENTS);
        Object.freeze(PAGEDELTA);

    } catch (error) {

        /*
         * Freezing is not essential to runtime behavior.
         * Never allow it to break the extension.
         */
        console.warn(
            "[PageDelta] Could not freeze configuration:",
            error
        );
    }


    /*
     * Expose the namespace globally.
     *
     * PageDelta currently uses classic content scripts
     * rather than ES modules.
     */
    globalThis.PAGEDELTA = PAGEDELTA;


    console.log(
        "[PageDelta] Constants loaded:",
        PAGEDELTA.VERSION
    );

})();