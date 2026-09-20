/*
 * PageDelta
 * Content Script
 */

(function () {

    "use strict";


    const PAGEDELTA_CONTENT = {

        initialized: false,

        currentUrl:
            window.location.href,

        lastAnalysis: null,

        panelVisible: false
    };


    /*
     * Initialize PageDelta on the page.
     */
    async function initializePageDelta() {

        if (
            PAGEDELTA_CONTENT.initialized
        ) {
            return;
        }


        PAGEDELTA_CONTENT.initialized =
            true;


        console.log(
            "[PageDelta] Initializing..."
        );


        /*
         * Create the floating interface.
         */
        if (
            typeof initializeFloatingPanel ===
            "function"
        ) {

            initializeFloatingPanel();
        }


        /*
         * Start observing webpage changes.
         */
        if (
            typeof initializePageObserver ===
            "function"
        ) {

            initializePageObserver(
                handlePageChange
            );
        }


        /*
         * Listen for messages from
         * popup/background scripts.
         */
        chrome.runtime.onMessage.addListener(
            handleRuntimeMessage
        );


        /*
         * Check current page.
         */
        await analyzeCurrentPage();


        console.log(
            "[PageDelta] Ready."
        );
    }


    /*
     * Analyze the current webpage.
     */
    async function analyzeCurrentPage() {

        try {

            if (
                typeof analyzePage !==
                "function"
            ) {

                console.warn(
                    "[PageDelta] pageAnalyzer.js is not available."
                );

                return null;
            }


            const analysis =
                await analyzePage();

            if (
                analysis &&
                Array.isArray(
                    analysis.fields
                ) &&
                PAGEDELTA &&
                PAGEDELTA.STORAGE &&
                PAGEDELTA.STORAGE.informationVault &&
                typeof PAGEDELTA.STORAGE.informationVault
                    .buildFieldPermissionPreview ===
                    "function"
            ) {
                analysis.fieldMatches =
                    await PAGEDELTA.STORAGE
                        .informationVault
                        .buildFieldPermissionPreview(
                            analysis.fields
                        );
            }


            PAGEDELTA_CONTENT.lastAnalysis =
                analysis;


            /*
             * Send analysis to background.
             */
            chrome.runtime.sendMessage({

                type:
                    "PAGE_ANALYZED",

                data:
                    analysis
            });


            /*
             * Update floating panel.
             */
            if (
                typeof updateFloatingPanel ===
                "function"
            ) {

                updateFloatingPanel(
                    analysis
                );
            }


            return analysis;

        } catch (error) {

            console.error(
                "[PageDelta] Analysis failed:",
                error
            );


            showPageDeltaError(
                "Unable to analyze this page."
            );


            return null;
        }
    }


    /*
     * Handle changes detected by
     * pageObserver.js.
     */
    async function handlePageChange(
        change
    ) {

        console.log(
            "[PageDelta] Page change detected:",
            change
        );


        /*
         * If URL changed, treat it
         * as a new page.
         */
        if (
            change &&
            change.type ===
            "url-change"
        ) {

            PAGEDELTA_CONTENT.currentUrl =
                window.location.href;


            await analyzeCurrentPage();

            return;
        }


        /*
         * For DOM changes, re-analyze
         * after a short delay.
         */
        scheduleAnalysis();
    }


    let analysisTimer = null;


    function scheduleAnalysis() {

        if (analysisTimer) {

            clearTimeout(
                analysisTimer
            );
        }


        analysisTimer =
            setTimeout(
                async () => {

                    await analyzeCurrentPage();

                    analysisTimer =
                        null;

                },
                1200
            );
    }


    /*
     * Handle messages from the
     * extension.
     */
    function handleRuntimeMessage(
        message,
        sender,
        sendResponse
    ) {

        if (!message) {
            return;
        }


        switch (
            message.type
        ) {

            case "ANALYZE_PAGE":

                analyzeCurrentPage()
                    .then(
                        result => {

                            sendResponse({
                                success: true,
                                data: result
                            });
                        }
                    )
                    .catch(
                        error => {

                            sendResponse({
                                success: false,
                                error:
                                    error.message
                            });
                        }
                    );


                return true;


            case "GET_PAGE_ANALYSIS":

                sendResponse({

                    success: true,

                    data:
                        PAGEDELTA_CONTENT
                            .lastAnalysis
                });

                break;


            case "SHOW_PANEL":

                if (
                    typeof showFloatingPanel ===
                    "function"
                ) {

                    showFloatingPanel();
                }

                break;


            case "HIDE_PANEL":

                if (
                    typeof hideFloatingPanel ===
                    "function"
                ) {

                    hideFloatingPanel();
                }

                break;


            case "TOGGLE_PANEL":

                if (
                    typeof toggleFloatingPanel ===
                    "function"
                ) {

                    toggleFloatingPanel();
                }

                break;


            case "PING":

                sendResponse({
                    success: true,
                    message:
                        "PageDelta content script is active."
                });

                break;
        }
    }


    /*
     * Display a simple error message.
     */
    function showPageDeltaError(
        message
    ) {

        if (
            typeof showPanelMessage ===
            "function"
        ) {

            showPanelMessage(
                message,
                "error"
            );
        }
    }


    /*
     * Expose controller.
     */
    globalThis.PAGEDELTA_CONTENT =
        PAGEDELTA_CONTENT;


    globalThis.initializePageDelta =
        initializePageDelta;


    /*
     * Start after DOM is ready.
     */
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePageDelta,
            {
                once: true
            }
        );

    } else {

        initializePageDelta();
    }

})();