/*
 * PageDelta
 * Purpose-Aware Floating Panel
 */

(function () {

    "use strict";


    let panel = null;

    let button = null;

    let content = null;


    /*
     * Current user-selected purpose.
     *
     * IMPORTANT:
     * This exists only for the current page/session.
     * It is NOT permanently saved.
     */

    let currentUserPurpose =
        "";


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


        button =
            document.createElement(
                "button"
            );


        button.id =
            "pagedelta-floating-button";


        button.className =
            "pagedelta-floating-button";


        button.type =
            "button";


        button.title =
            "Open PageDelta";


        button.setAttribute(
            "aria-label",
            "Open PageDelta"
        );


        button.innerHTML = `
            <span
                class="pagedelta-logo-mark"
                aria-hidden="true"
            >
                P
            </span>
        `;


        button.addEventListener(
            "click",
            toggleFloatingPanel
        );


        panel =
            document.createElement(
                "div"
            );


        panel.id =
            "pagedelta-panel";


        panel.className =
            "pagedelta-panel";


        panel.setAttribute(
            "role",
            "dialog"
        );


        panel.setAttribute(
            "aria-label",
            "PageDelta"
        );


        panel.style.display =
            "none";


        const header =
            document.createElement(
                "div"
            );


        header.className =
            "pagedelta-panel-header";


        header.innerHTML = `

            <div class="pagedelta-panel-title">

                <span class="pagedelta-brand-mark">
                    P
                </span>

                <span>
                    PageDelta
                </span>

            </div>

        `;


        const closeButton =
            document.createElement(
                "button"
            );


        closeButton.className =
            "pagedelta-close-button";


        closeButton.type =
            "button";


        closeButton.textContent =
            "×";


        closeButton.setAttribute(
            "aria-label",
            "Close"
        );


        closeButton.addEventListener(
            "click",
            hideFloatingPanel
        );


        header.appendChild(
            closeButton
        );


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


    function hideFloatingPanel() {

        if (!panel) {
            return;
        }


        panel.style.display =
            "none";


        button.style.display =
            "flex";
    }


    function toggleFloatingPanel() {

        if (!panel) {

            initializeFloatingPanel();
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


    function showPanelLoading() {

        if (!content) {
            return;
        }


        content.innerHTML = `

            <div class="pagedelta-loading">

                <div
                    class="pagedelta-spinner"
                    aria-hidden="true"
                ></div>

                <div>
                    Understanding this page...
                </div>

            </div>

        `;
    }


    /*
     * --------------------------------------------------
     * Main update
     * --------------------------------------------------
     */

    function updateFloatingPanel(
        analysis
    ) {

        if (!content) {
            return;
        }


        if (!analysis) {

            showPanelMessage(
                "Page information is not available.",
                "info"
            );

            return;
        }


        content.innerHTML =
            "";


        let presentation;


        try {

            if (
                typeof createPagePresentation ===
                "function"
            ) {

                presentation =
                    createPagePresentation(
                        analysis,
                        currentUserPurpose
                    );

            }

        } catch (error) {

            console.error(
                "[PageDelta] Presentation failed:",
                error
            );
        }


        if (!presentation) {

            presentation =
                createFallbackPresentation(
                    analysis
                );
        }


        renderTitle(
            presentation.title
        );


        renderSummary(
            presentation
        );


        renderPurpose(
            presentation,
            analysis
        );


        renderInformation(
            presentation
        );


        renderFields(
            presentation
        );


        renderFooter();
    }


    /*
     * --------------------------------------------------
     * Title
     * --------------------------------------------------
     */

    function renderTitle(
        title
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "pagedelta-page-title";


        element.textContent =
            title ||
            "Current webpage";


        content.appendChild(
            element
        );
    }


    /*
     * --------------------------------------------------
     * Summary
     * --------------------------------------------------
     */

    function renderSummary(
        presentation
    ) {

        const section =
            createSection(
                "What is this page?"
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pagedelta-summary-card";


        const paragraph =
            document.createElement(
                "p"
            );


        paragraph.textContent =
            presentation.summary &&
            presentation.summary.text
                ? presentation.summary.text
                : "Information from this webpage.";


        card.appendChild(
            paragraph
        );


        section.appendChild(
            card
        );


        content.appendChild(
            section
        );
    }


    /*
     * --------------------------------------------------
     * Purpose
     * --------------------------------------------------
     */

    function renderPurpose(
        presentation,
        analysis
    ) {

        const section =
            createSection(
                currentUserPurpose
                    ? "Your purpose"
                    : "What PageDelta thinks you want to do"
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pagedelta-purpose-card";


        const icon =
            document.createElement(
                "div"
            );


        icon.className =
            "pagedelta-purpose-icon";


        icon.textContent =
            currentUserPurpose
                ? "✓"
                : "?" ;


        const body =
            document.createElement(
                "div"
            );


        body.className =
            "pagedelta-purpose-content";


        const label =
            document.createElement(
                "div"
            );


        label.className =
            "pagedelta-purpose-label";


        label.textContent =
            presentation.purpose &&
            presentation.purpose.purpose
                ? presentation.purpose.purpose
                : "Understand this webpage";


        body.appendChild(
            label
        );


        if (
            presentation.purpose &&
            presentation.purpose.confidence
        ) {

            const confidence =
                document.createElement(
                    "div"
                );


            confidence.className =
                "pagedelta-confidence";


            confidence.textContent =
                currentUserPurpose
                    ? "Using your selected purpose"
                    : `${presentation.purpose.confidence}% confidence`;


            body.appendChild(
                confidence
            );
        }


        card.appendChild(
            icon
        );


        card.appendChild(
            body
        );


        section.appendChild(
            card
        );


        /*
         * Don't repeatedly ask after user has
         * already provided a purpose.
         */

        if (!currentUserPurpose) {

            const question =
                document.createElement(
                    "div"
                );


            question.className =
                "pagedelta-purpose-question";


            question.textContent =
                "Is this what you're here for?";


            section.appendChild(
                question
            );


            const buttons =
                document.createElement(
                    "div"
                );


            buttons.className =
                "pagedelta-purpose-buttons";


            const yes =
                createButton(
                    "Yes",
                    "primary"
                );


            const no =
                createButton(
                    "No",
                    "secondary"
                );


            yes.addEventListener(
                "click",
                () => {

                    /*
                     * Lock in the detected purpose
                     * only for this current page.
                     */

                    currentUserPurpose =
                        presentation.purpose &&
                        presentation.purpose.purpose
                            ? presentation.purpose.purpose
                            : "";

                    updateFloatingPanel(
                        analysis
                    );
                }
            );


            no.addEventListener(
                "click",
                () => {

                    showPurposeInput(
                        section,
                        analysis
                    );
                }
            );


            buttons.appendChild(
                yes
            );


            buttons.appendChild(
                no
            );


            section.appendChild(
                buttons
            );
        }


        content.appendChild(
            section
        );
    }


    /*
     * --------------------------------------------------
     * User purpose input
     * --------------------------------------------------
     */

    function showPurposeInput(
        section,
        analysis
    ) {

        if (
            section.querySelector(
                ".pagedelta-purpose-correction"
            )
        ) {
            return;
        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "pagedelta-purpose-correction";


        const label =
            document.createElement(
                "label"
            );


        label.textContent =
            "What are you trying to do on this page?";


        const input =
            document.createElement(
                "input"
            );


        input.type =
            "text";


        input.maxLength =
            200;


        input.placeholder =
            "Example: find the assignment deadline";


        const apply =
            createButton(
                "Apply purpose",
                "primary"
            );


        apply.addEventListener(
            "click",
            () => {

                const purpose =
                    input.value.trim();


                if (!purpose) {

                    input.focus();

                    return;
                }


                /*
                 * This is deliberately contextual.
                 *
                 * It is NOT written into storage.
                 */

                currentUserPurpose =
                    purpose;


                /*
                 * Rebuild the complete presentation.
                 *
                 * THIS is the missing behavior
                 * you were asking about.
                 */

                updateFloatingPanel(
                    analysis
                );
            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    apply.click();
                }
            }
        );


        wrapper.appendChild(
            label
        );


        wrapper.appendChild(
            input
        );


        wrapper.appendChild(
            apply
        );


        section.appendChild(
            wrapper
        );


        input.focus();
    }


    /*
     * --------------------------------------------------
     * Important information
     * --------------------------------------------------
     */

    function renderInformation(
        presentation
    ) {

        const items =
            Array.isArray(
                presentation.importantInformation
            )
                ? presentation.importantInformation
                : [];


        /*
         * Fields have their own section, so
         * don't show them here.
         */

        const nonFields =
            items.filter(
                item =>
                    item.type !==
                    "field"
            );


        if (!nonFields.length) {
            return;
        }


        const section =
            createSection(
                "Information that matters"
            );


        nonFields
            .slice(
                0,
                7
            )
            .forEach(
                item => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "pagedelta-important-card";


                    const icon =
                        document.createElement(
                            "div"
                        );


                    icon.className =
                        "pagedelta-important-icon";


                    icon.textContent =
                        item.icon ||
                        "•";


                    const body =
                        document.createElement(
                            "div"
                        );


                    body.className =
                        "pagedelta-important-body";


                    const title =
                        document.createElement(
                            "div"
                        );


                    title.className =
                        "pagedelta-important-title";


                    title.textContent =
                        item.title ||
                        "Information";


                    const text =
                        document.createElement(
                            "div"
                        );


                    text.className =
                        "pagedelta-important-text";


                    text.textContent =
                        item.text ||
                        "";


                    body.appendChild(
                        title
                    );


                    body.appendChild(
                        text
                    );


                    card.appendChild(
                        icon
                    );


                    card.appendChild(
                        body
                    );


                    section.appendChild(
                        card
                    );
                }
            );


        content.appendChild(
            section
        );
    }


    /*
     * --------------------------------------------------
     * Specific form fields
     * --------------------------------------------------
     */

    function renderFields(
        presentation
    ) {

        const fields =
            Array.isArray(
                presentation.fields
            )
                ? presentation.fields
                : [];


        if (!fields.length) {
            return;
        }


        const section =
            createSection(
                "Information requested"
            );


        const intro =
            document.createElement(
                "p"
            );


        intro.className =
            "pagedelta-field-intro";


        intro.textContent =
            "This page is asking for the following information:";


        section.appendChild(
            intro
        );


        const list =
            document.createElement(
                "div"
            );


        list.className =
            "pagedelta-field-list";


        fields
            .slice(
                0,
                12
            )
            .forEach(
                field => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "pagedelta-field-item";


                    const check =
                        document.createElement(
                            "span"
                        );


                    check.className =
                        "pagedelta-field-check";


                    check.textContent =
                        field.required
                            ? "!"
                            : "✓";


                    const body =
                        document.createElement(
                            "div"
                        );


                    body.className =
                        "pagedelta-field-body";


                    const name =
                        document.createElement(
                            "div"
                        );


                    name.className =
                        "pagedelta-field-name";


                    name.textContent =
                        field.title ||
                        "Other information";


                    const status =
                        document.createElement(
                            "div"
                        );


                    status.className =
                        "pagedelta-field-status";


                    status.textContent =
                        field.required
                            ? "Required"
                            : "Optional";


                    body.appendChild(
                        name
                    );


                    body.appendChild(
                        status
                    );


                    item.appendChild(
                        check
                    );


                    item.appendChild(
                        body
                    );


                    list.appendChild(
                        item
                    );
                }
            );


        section.appendChild(
            list
        );


        content.appendChild(
            section
        );
    }


    /*
     * --------------------------------------------------
     * Footer
     * --------------------------------------------------
     */

    function renderFooter() {

        const footer =
            document.createElement(
                "div"
            );


        footer.className =
            "pagedelta-footer";


        footer.textContent =
            "PageDelta · Your information stays under your control";


        content.appendChild(
            footer
        );
    }


    /*
     * --------------------------------------------------
     * Helpers
     * --------------------------------------------------
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


    function createButton(
        text,
        variant
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            `pagedelta-action-button pagedelta-${variant}`;


        button.textContent =
            text;


        return button;
    }


    function showPanelMessage(
        message,
        type = "info"
    ) {

        if (!content) {
            return;
        }


        content.innerHTML =
            "";


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


    function createFallbackPresentation(
        analysis
    ) {

        return {

            title:
                analysis.title ||
                "Current webpage",

            summary: {

                text:
                    "Information from this webpage."
            },

            purpose: {

                purpose:
                    currentUserPurpose ||
                    "Understand this webpage",

                confidence:
                    20
            },

            importantInformation: [],

            fields:
                [],

            counts: {

                fields:
                    Array.isArray(
                        analysis.fields
                    )
                        ? analysis.fields.length
                        : 0
            }
        };
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


    console.log(
        "[PageDelta] Purpose-aware floating panel loaded."
    );

})();