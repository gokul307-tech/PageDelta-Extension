/*
 * PageDelta
 * Floating Panel
 */

(function () {

    "use strict";


    let panel = null;

    let button = null;

    let content = null;


    /*
     * Create the PageDelta interface.
     */
    function initializeFloatingPanel() {

        if (
            document.getElementById(
                "pagedelta-root"
            )
        ) {

            return;
        }


        const root =
            document.createElement(
                "div"
            );


        root.id =
            "pagedelta-root";


        root.setAttribute(
            "data-pagedelta",
            "true"
        );


        /*
         * Floating button.
         */
        button =
            document.createElement(
                "button"
            );


        button.id =
            "pagedelta-floating-button";


        button.className =
            "pagedelta-floating-button";


        button.textContent =
            "PD";


        button.title =
            "Open PageDelta";


        button.addEventListener(
            "click",
            toggleFloatingPanel
        );


        /*
         * Main panel.
         */
        panel =
            document.createElement(
                "div"
            );


        panel.id =
            "pagedelta-panel";


        panel.className =
            "pagedelta-panel";


        panel.style.display =
            "none";


        /*
         * Header.
         */
        const header =
            document.createElement(
                "div"
            );


        header.className =
            "pagedelta-panel-header";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "pagedelta-panel-title";


        title.textContent =
            "PageDelta";


        const closeButton =
            document.createElement(
                "button"
            );


        closeButton.className =
            "pagedelta-close-button";


        closeButton.textContent =
            "×";


        closeButton.addEventListener(
            "click",
            hideFloatingPanel
        );


        header.appendChild(
            title
        );


        header.appendChild(
            closeButton
        );


        /*
         * Content.
         */
        content =
            document.createElement(
                "div"
            );


        content.className =
            "pagedelta-panel-content";


        showPanelLoading();


        panel.appendChild(
            header
        );


        panel.appendChild(
            content
        );


        root.appendChild(
            button
        );


        root.appendChild(
            panel
        );


        document.documentElement.appendChild(
            root
        );
    }


    /*
     * Show panel.
     */
    function showFloatingPanel() {

        if (!panel) {
            initializeFloatingPanel();
        }


        panel.style.display =
            "block";


        button.style.display =
            "none";


        if (
            globalThis.PAGEDELTA_CONTENT &&
            PAGEDELTA_CONTENT.lastAnalysis
        ) {

            updateFloatingPanel(
                PAGEDELTA_CONTENT.lastAnalysis
            );
        }
    }


    /*
     * Hide panel.
     */
    function hideFloatingPanel() {

        if (!panel) {
            return;
        }


        panel.style.display =
            "none";


        button.style.display =
            "flex";
    }


    /*
     * Toggle panel.
     */
    function toggleFloatingPanel() {

        if (!panel) {

            initializeFloatingPanel();

            showFloatingPanel();

            return;
        }


        if (
            panel.style.display ===
            "none"
        ) {

            showFloatingPanel();

        } else {

            hideFloatingPanel();
        }
    }


    /*
     * Show loading state.
     */
    function showPanelLoading() {

        if (!content) {
            return;
        }


        content.innerHTML = `

            <div class="pagedelta-loading">

                <div class="pagedelta-spinner"></div>

                <div>
                    Analyzing page...
                </div>

            </div>
        `;
    }


    /*
     * Update panel with analysis.
     */
    function updateFloatingPanel(
        analysis
    ) {

        if (!content) {
            return;
        }


        if (!analysis) {

            showPanelMessage(
                "No analysis available.",
                "info"
            );

            return;
        }


        const title =
            analysis.title ||
            document.title ||
            "Current Page";


        const importance =
            analysis.importance ??
            0;


        const importanceLevel =
            analysis.importanceLevel ||
            "low";


        const deadlines =
            Array.isArray(
                analysis.deadlines
            )
                ? analysis.deadlines
                : [];


        const requirements =
            Array.isArray(
                analysis.requirements
            )
                ? analysis.requirements
                : [];


        content.innerHTML = "";


        /*
         * Page title.
         */
        const pageTitle =
            document.createElement(
                "div"
            );


        pageTitle.className =
            "pagedelta-page-title";


        pageTitle.textContent =
            title;


        content.appendChild(
            pageTitle
        );


        /*
         * Importance.
         */
        const importanceCard =
            createInfoCard(
                "Importance",
                `${importance}/100`
            );


        importanceCard.dataset.level =
            importanceLevel;


        content.appendChild(
            importanceCard
        );


        /*
         * Deadlines.
         */
        if (deadlines.length) {

            const section =
                createSection(
                    "Deadlines"
                );


            deadlines
                .slice(0, 5)
                .forEach(
                    deadline => {

                        section.appendChild(
                            createListItem(
                                formatAnalysisItem(
                                    deadline
                                )
                            )
                        );
                    }
                );


            content.appendChild(
                section
            );
        }


        /*
         * Requirements.
         */
        if (requirements.length) {

            const section =
                createSection(
                    "Requirements"
                );


            requirements
                .slice(0, 5)
                .forEach(
                    requirement => {

                        section.appendChild(
                            createListItem(
                                formatAnalysisItem(
                                    requirement
                                )
                            )
                        );
                    }
                );


            content.appendChild(
                section
            );
        }


        /*
         * No detected information.
         */
        if (
            !deadlines.length &&
            !requirements.length
        ) {

            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "pagedelta-empty";


            message.textContent =
                "No important actions detected on this page.";


            content.appendChild(
                message
            );
        }
    }


    /*
     * Create information card.
     */
    function createInfoCard(
        label,
        value
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pagedelta-info-card";


        const labelElement =
            document.createElement(
                "span"
            );


        labelElement.textContent =
            label;


        const valueElement =
            document.createElement(
                "strong"
            );


        valueElement.textContent =
            value;


        card.appendChild(
            labelElement
        );


        card.appendChild(
            valueElement
        );


        return card;
    }


    /*
     * Create section.
     */
    function createSection(
        title
    ) {

        const section =
            document.createElement(
                "section"
            );


        section.className =
            "pagedelta-section";


        const heading =
            document.createElement(
                "h3"
            );


        heading.textContent =
            title;


        section.appendChild(
            heading
        );


        return section;
    }


    /*
     * Create list item.
     */
    function createListItem(
        text
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "pagedelta-list-item";


        item.textContent =
            text;


        return item;
    }


    /*
     * Safely format analyzer output.
     */
    function formatAnalysisItem(
        item
    ) {

        if (
            typeof item ===
            "string"
        ) {

            return item;
        }


        if (!item) {
            return "";
        }


        return (
            item.text ||
            item.title ||
            item.description ||
            item.value ||
            JSON.stringify(item)
        );
    }


    /*
     * Show a message.
     */
    function showPanelMessage(
        message,
        type = "info"
    ) {

        if (!content) {
            return;
        }


        content.innerHTML = "";


        const element =
            document.createElement(
                "div"
            );


        element.className =
            `pagedelta-message pagedelta-${type}`;


        element.textContent =
            message;


        content.appendChild(
            element
        );
    }


    globalThis.initializeFloatingPanel =
        initializeFloatingPanel;


    globalThis.showFloatingPanel =
        showFloatingPanel;


    globalThis.hideFloatingPanel =
        hideFloatingPanel;


    globalThis.toggleFloatingPanel =
        toggleFloatingPanel;


    globalThis.updateFloatingPanel =
        updateFloatingPanel;


    globalThis.showPanelLoading =
        showPanelLoading;


    globalThis.showPanelMessage =
        showPanelMessage;

})();