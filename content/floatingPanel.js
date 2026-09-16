/*
 * PageDelta
 * Human-Friendly Floating Panel
 */

(function () {

    "use strict";


    let panel = null;

    let button = null;

    let content = null;


    /*
     * --------------------------------------------------
     * Initialization
     * --------------------------------------------------
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
         * Floating PageDelta button.
         */

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


        button.setAttribute(
            "aria-label",
            "Open PageDelta"
        );


        button.title =
            "Open PageDelta";


        /*
         * Use a simple logo mark for now.
         *
         * We will replace this with the actual
         * PageDelta image asset in the UI polish stage.
         */

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


        panel.setAttribute(
            "role",
            "dialog"
        );


        panel.setAttribute(
            "aria-label",
            "PageDelta page information"
        );


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


        title.innerHTML = `
            <span class="pagedelta-brand-mark">
                P
            </span>

            <span>
                PageDelta
            </span>
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
            "Close PageDelta"
        );


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
         * Content area.
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
     * --------------------------------------------------
     * Visibility
     * --------------------------------------------------
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
     * --------------------------------------------------
     * Loading
     * --------------------------------------------------
     */

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


        content.innerHTML = "";


        /*
         * Build presentation layer.
         */

        let presentation = null;


        if (
            typeof createPagePresentation ===
            "function"
        ) {

            try {

                presentation =
                    createPagePresentation(
                        analysis
                    );

            } catch (error) {

                console.error(
                    "[PageDelta] Presentation error:",
                    error
                );
            }
        }


        /*
         * Fallback if presentation layer
         * is unavailable.
         */

        if (!presentation) {

            presentation =
                buildFallbackPresentation(
                    analysis
                );
        }


        /*
         * Page title.
         */

        createPageTitle(
            presentation.title
        );


        /*
         * Page summary.
         */

        createSummarySection(
            presentation
        );


        /*
         * Purpose section.
         */

        createPurposeSection(
            presentation
        );


        /*
         * Important information.
         */

        createImportantSection(
            presentation
        );


        /*
         * Importance.
         */

        createImportanceSection(
            presentation
        );


        /*
         * Form information.
         */

        createFormSection(
            presentation
        );


        /*
         * Empty state.
         */

        if (
            !presentation.importantInformation.length &&
            !presentation.counts.fields
        ) {

            createEmptySection();
        }


        /*
         * Footer.
         */

        createFooter();
    }


    /*
     * --------------------------------------------------
     * Title
     * --------------------------------------------------
     */

    function createPageTitle(
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

    function createSummarySection(
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


        const text =
            document.createElement(
                "p"
            );


        text.textContent =
            presentation.summary &&
            presentation.summary.text
                ? presentation.summary.text
                : "Information from this webpage.";


        card.appendChild(
            text
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

    function createPurposeSection(
        presentation
    ) {

        const section =
            createSection(
                "You may be here to"
            );


        const purpose =
            presentation.purpose &&
            presentation.purpose.purpose
                ? presentation.purpose.purpose
                : "Understand this webpage";


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
            "✓";


        const textContainer =
            document.createElement(
                "div"
            );


        textContainer.className =
            "pagedelta-purpose-content";


        const label =
            document.createElement(
                "div"
            );


        label.className =
            "pagedelta-purpose-label";


        label.textContent =
            purpose;


        textContainer.appendChild(
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
                `${presentation.purpose.confidence}% confidence`;


            textContainer.appendChild(
                confidence
            );
        }


        card.appendChild(
            icon
        );


        card.appendChild(
            textContainer
        );


        section.appendChild(
            card
        );


        /*
         * Purpose confirmation.
         *
         * These buttons currently provide the
         * interface only. The actual contextual
         * re-analysis behavior will be implemented
         * in the next stage.
         */

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


        const yesButton =
            createActionButton(
                "Yes",
                "primary"
            );


        const noButton =
            createActionButton(
                "No",
                "secondary"
            );


        yesButton.addEventListener(
            "click",
            () => {

                showPanelMessage(
                    "Got it. PageDelta will use this purpose for this page.",
                    "success"
                );

                setTimeout(
                    () => {

                        if (
                            PAGEDELTA_CONTENT &&
                            PAGEDELTA_CONTENT.lastAnalysis
                        ) {

                            updateFloatingPanel(
                                PAGEDELTA_CONTENT.lastAnalysis
                            );
                        }

                    },
                    900
                );
            }
        );


        noButton.addEventListener(
            "click",
            () => {

                showPurposeCorrection(
                    section,
                    presentation
                );
            }
        );


        buttons.appendChild(
            yesButton
        );


        buttons.appendChild(
            noButton
        );


        section.appendChild(
            buttons
        );


        content.appendChild(
            section
        );
    }


    /*
     * --------------------------------------------------
     * Purpose correction UI
     * --------------------------------------------------
     */

    function showPurposeCorrection(
        section,
        presentation
    ) {

        const existing =
            section.querySelector(
                ".pagedelta-purpose-correction"
            );


        if (existing) {
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


        input.placeholder =
            "For example: check the deadline";


        input.maxLength =
            200;


        const submit =
            createActionButton(
                "Use this purpose",
                "primary"
            );


        submit.addEventListener(
            "click",
            () => {

                const value =
                    input.value.trim();


                if (!value) {

                    input.focus();

                    return;
                }


                /*
                 * Temporary contextual result.
                 *
                 * We deliberately do NOT save this
                 * as a permanent domain rule.
                 *
                 * The full contextual purpose system
                 * comes in the next stage.
                 */

                presentation.purpose = {

                    purpose:
                        value,

                    confidence:
                        100,

                    userProvided:
                        true
                };


                wrapper.innerHTML = `

                    <div
                        class="pagedelta-correction-success"
                    >
                        ✓ PageDelta will focus on:
                        <strong></strong>
                    </div>
                `;


                const strong =
                    wrapper.querySelector(
                        "strong"
                    );


                strong.textContent =
                    value;
            }
        );


        wrapper.appendChild(
            label
        );


        wrapper.appendChild(
            input
        );


        wrapper.appendChild(
            submit
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

    function createImportantSection(
        presentation
    ) {

        const items =
            Array.isArray(
                presentation.importantInformation
            )
                ? presentation.importantInformation
                : [];


        if (!items.length) {
            return;
        }


        const section =
            createSection(
                "Important information"
            );


        items
            .slice(0, 6)
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
     * Importance
     * --------------------------------------------------
     */

    function createImportanceSection(
        presentation
    ) {

        const score =
            presentation.importance &&
            Number.isFinite(
                Number(
                    presentation.importance.score
                )
            )
                ? Number(
                    presentation.importance.score
                )
                : 0;


        const level =
            presentation.importance &&
            presentation.importance.level
                ? presentation.importance.level
                : "low";


        const section =
            createSection(
                "Page importance"
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pagedelta-importance-card";


        card.dataset.level =
            level;


        const label =
            document.createElement(
                "span"
            );


        label.textContent =
            "Importance";


        const value =
            document.createElement(
                "strong"
            );


        value.textContent =
            `${score}/100`;


        card.appendChild(
            label
        );


        card.appendChild(
            value
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
     * Form information
     * --------------------------------------------------
     */

    function createFormSection(
        presentation
    ) {

        const count =
            presentation.counts &&
            Number(
                presentation.counts.fields
            ) || 0;


        if (!count) {
            return;
        }


        const section =
            createSection(
                "Information requested"
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pagedelta-form-notice";


        card.innerHTML = `

            <div class="pagedelta-form-icon">
                📝
            </div>

            <div>
                <strong>
                    This page is asking for information.
                </strong>

                <p>
                    PageDelta can help identify the
                    fields before anything is filled.
                </p>
            </div>

        `;


        section.appendChild(
            card
        );


        content.appendChild(
            section
        );
    }


    /*
     * --------------------------------------------------
     * Empty state
     * --------------------------------------------------
     */

    function createEmptySection() {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "pagedelta-empty";


        element.innerHTML = `

            <div class="pagedelta-empty-icon">
                ✓
            </div>

            <div>
                PageDelta did not find any
                additional important information.
            </div>

        `;


        content.appendChild(
            element
        );
    }


    /*
     * --------------------------------------------------
     * Footer
     * --------------------------------------------------
     */

    function createFooter() {

        const footer =
            document.createElement(
                "div"
            );


        footer.className =
            "pagedelta-footer";


        footer.textContent =
            "PageDelta · Information stays local";


        content.appendChild(
            footer
        );
    }


    /*
     * --------------------------------------------------
     * UI helpers
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


    function createActionButton(
        text,
        variant = "secondary"
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


    /*
     * --------------------------------------------------
     * Fallback presentation
     * --------------------------------------------------
     */

    function buildFallbackPresentation(
        analysis
    ) {

        const requirements =
            Array.isArray(
                analysis.requirements
            )
                ? analysis.requirements
                : [];


        return {

            title:
                analysis.title ||
                "Current webpage",

            summary: {

                text:
                    analysis.title
                        ? `Information about ${analysis.title}.`
                        : "Information from this webpage."
            },

            purpose: {

                purpose:
                    "Understand this webpage",

                confidence:
                    20
            },

            importantInformation:
                requirements
                    .slice(0, 5)
                    .map(
                        requirement => ({

                            type:
                                "requirement",

                            icon:
                                "📋",

                            title:
                                "Requirement",

                            text:
                                typeof requirement ===
                                "string"
                                    ? requirement
                                    : (
                                        requirement &&
                                        (
                                            requirement.context ||
                                            requirement.text ||
                                            requirement.description ||
                                            ""
                                        )
                                    ),

                            priority:
                                50
                        })
                    )
                    .filter(
                        item =>
                            item.text
                    ),

            counts: {

                fields:
                    Array.isArray(
                        analysis.fields
                    )
                        ? analysis.fields.length
                        : 0
            },

            importance: {

                score:
                    Number(
                        analysis.importance
                    ) || 0,

                level:
                    analysis.importanceLevel ||
                    "low"
            }
        };
    }


    /*
     * --------------------------------------------------
     * Exports
     * --------------------------------------------------
     */

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
        "[PageDelta] Human-friendly floating panel loaded."
    );

})();