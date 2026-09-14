/*
 * PageDelta
 * Page Observer
 */

(function () {

    "use strict";


    let observer = null;

    let callback = null;

    let mutationTimer = null;

    let lastUrl =
        window.location.href;


    /*
     * Initialize observer.
     */
    function initializePageObserver(
        onChange
    ) {

        callback =
            typeof onChange ===
            "function"
                ? onChange
                : null;


        if (observer) {
            observer.disconnect();
        }


        observer =
            new MutationObserver(
                handleMutations
            );


        if (document.body) {

            observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true,
                    characterData: true
                }
            );
        }


        /*
         * Monitor URL changes.
         */
        setInterval(
            checkUrlChange,
            1000
        );


        return observer;
    }


    /*
     * Handle DOM mutations.
     */
    function handleMutations(
        mutations
    ) {

        if (
            !mutations ||
            !mutations.length
        ) {
            return;
        }


        /*
         * Ignore changes caused by
         * PageDelta itself.
         */
        const meaningfulChange =
            mutations.some(
                mutation =>
                    !isPageDeltaElement(
                        mutation.target
                    )
            );


        if (!meaningfulChange) {
            return;
        }


        /*
         * Debounce rapid mutations.
         */
        if (mutationTimer) {

            clearTimeout(
                mutationTimer
            );
        }


        mutationTimer =
            setTimeout(
                () => {

                    notifyChange({

                        type:
                            "dom-change",

                        mutationCount:
                            mutations.length,

                        timestamp:
                            Date.now()
                    });

                },
                700
            );
    }


    /*
     * Detect SPA URL changes.
     */
    function checkUrlChange() {

        const currentUrl =
            window.location.href;


        if (
            currentUrl ===
            lastUrl
        ) {
            return;
        }


        const previousUrl =
            lastUrl;


        lastUrl =
            currentUrl;


        notifyChange({

            type:
                "url-change",

            previousUrl,

            url:
                currentUrl,

            timestamp:
                Date.now()
        });
    }


    /*
     * Send change to controller.
     */
    function notifyChange(
        change
    ) {

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                change
            );
        }
    }


    /*
     * Determine whether an element
     * belongs to PageDelta.
     */
    function isPageDeltaElement(
        element
    ) {

        if (!element) {
            return false;
        }


        if (
            element.nodeType !==
            Node.ELEMENT_NODE
        ) {

            element =
                element.parentElement;
        }


        if (!element) {
            return false;
        }


        return Boolean(
            element.closest(
                "[data-pagedelta]"
            )
        );
    }


    /*
     * Stop observing.
     */
    function stopPageObserver() {

        if (observer) {

            observer.disconnect();

            observer = null;
        }


        if (mutationTimer) {

            clearTimeout(
                mutationTimer
            );

            mutationTimer = null;
        }
    }


    globalThis.initializePageObserver =
        initializePageObserver;


    globalThis.stopPageObserver =
        stopPageObserver;

})();