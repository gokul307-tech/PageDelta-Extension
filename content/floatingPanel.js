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

    let currentShareDecision =
        null;

    let shareDecisionUrl =
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

        if (
            analysis.url !==
            shareDecisionUrl
        ) {
            shareDecisionUrl =
                analysis.url ||
                window.location.href;

            currentShareDecision =
                null;
        }


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


        renderSharePermission(
            analysis,
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

    function deriveFieldLabel(
        field
    ) {

        if (!field) {
            return "Information";
        }

        if (
            field.title &&
            field.title !==
            "Information"
        ) {
            return field.title;
        }

        if (
            field.fieldLabel
        ) {
            return field.fieldLabel;
        }

        if (
            field.label
        ) {
            return field.label;
        }

        if (
            field.fieldType &&
            typeof FIELD_LABELS !==
            "undefined" &&
            FIELD_LABELS[field.fieldType]
        ) {
            return FIELD_LABELS[field.fieldType];
        }

        if (
            field.vaultKey &&
            typeof FIELD_LABELS !==
            "undefined" &&
            FIELD_LABELS[field.vaultKey]
        ) {
            return FIELD_LABELS[field.vaultKey];
        }

        const fallback = [
            field.ariaLabel,
            field.placeholder,
            field.name,
            field.id
        ].find(Boolean);

        return fallback || "Information";
    }


    function renderFields(
        presentation
    ) {

        const fields =
            Array.isArray(
                presentation.fields
            )
                ? presentation.fields.filter(
                    field =>
                        field &&
                        field.type ===
                        "field"
                )
                : [];


        if (!fields.length) {
            return;
        }


        const requiredFields =
            fields.filter(
                field =>
                    field.required === true
            );

        const optionalFields =
            fields.filter(
                field =>
                    field.required !== true
            );


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
            "This form is asking for:";


        section.appendChild(
            intro
        );


        const allRows = [
            {
                label: "Required",
                items: requiredFields
            },
            {
                label: "Optional",
                items: optionalFields
            }
        ];


        allRows.forEach(
            group => {

                if (
                    !group.items.length
                ) {
                    return;
                }

                const heading =
                    document.createElement(
                        "div"
                    );

                heading.className =
                    "pagedelta-field-group-title";

                heading.textContent =
                    group.label;

                section.appendChild(
                    heading
                );

                const list =
                    document.createElement(
                        "div"
                    );

                list.className =
                    "pagedelta-field-list";

                group.items.forEach(
                    field => {

                        const item =
                            document.createElement(
                                "div"
                            );

                        item.className =
                            "pagedelta-field-item";

                        const match =
                            findFieldMatch(
                                field,
                                presentation
                            );

                        const label =
                            deriveFieldLabel(
                                field
                            );

                        const statusText =
                            match &&
                            match.protected
                                ? "Protected"
                                : match &&
                                  match.hasValue
                                    ? "Available"
                                    : "Missing";

                        const check =
                            document.createElement(
                                "span"
                            );

                        check.className =
                            "pagedelta-field-check";

                        check.textContent =
                            match &&
                            match.protected
                                ? "🔒"
                                : match &&
                                  match.hasValue
                                    ? "✓"
                                    : "⚠";

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
                            label;

                        const status =
                            document.createElement(
                                "div"
                            );

                        status.className =
                            "pagedelta-field-status";

                        status.textContent =
                            statusText;

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
            }
        );


        content.appendChild(
            section
        );
    }


    function renderSharePermission(
        analysis,
        presentation
    ) {

        const matches =
            Array.isArray(
                analysis.fieldMatches
            )
                ? analysis.fieldMatches.filter(
                    match =>
                        Boolean(
                            match
                        )
                )
                : [];

        if (
            !matches.length
        ) {
            return;
        }

        if (
            currentShareDecision ===
            null
        ) {
            const section =
                createSection(
                    "Share information?"
                );

            const note =
                document.createElement(
                    "p"
                );

            note.textContent =
                "PageDelta found form fields and will only use saved information if you allow it.";

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "pagedelta-action-row";

            const no =
                createButton(
                    "No",
                    "secondary"
                );

            no.addEventListener(
                "click",
                () => {
                    currentShareDecision =
                        false;

                    updateFloatingPanel(
                        analysis
                    );
                }
            );

            const yes =
                createButton(
                    "Yes",
                    "primary"
                );

            yes.addEventListener(
                "click",
                () => {
                    currentShareDecision =
                        true;

                    updateFloatingPanel(
                        analysis
                    );
                }
            );

            actions.append(
                no,
                yes
            );

            section.append(
                note,
                actions
            );

            content.appendChild(
                section
            );

            return;
        }

        if (
            currentShareDecision ===
            false
        ) {
            return;
        }

        showPermissionPreview(
            analysis,
            matches.filter(
                match =>
                    match.hasValue &&
                    !match.protected
            )
        );

        const missing =
            matches.filter(
                match =>
                    !match.hasValue &&
                    !match.protected
            );

        missing.forEach(
            match => {
                const field =
                    Array.isArray(
                        analysis.fields
                    )
                        ? analysis.fields.find(
                            candidate =>
                                candidate.vaultKey ===
                                match.vaultKey ||
                                candidate.id ===
                                match.id ||
                                candidate.name ===
                                match.id
                        )
                        : null;

                if (
                    !field
                ) {
                    return;
                }

                const button =
                    createButton(
                        `Enter ${match.label || "missing information"}`,
                        "secondary"
                    );

                button.addEventListener(
                    "click",
                    () => {
                        showMissingFieldPrompt(
                            field,
                            match
                        );
                    }
                );

                content.appendChild(
                    button
                );
            }
        );
    }


    function findFieldMatch(
        field,
        analysis
    ) {

        if (
            !field ||
            !analysis ||
            !Array.isArray(
                analysis.fieldMatches
            )
        ) {
            return null;
        }

        const selectors = [
            field.selector,
            field.id,
            field.name,
            field.label,
            field.placeholder,
            field.fieldType,
            field.fieldLabel
        ].filter(Boolean);

        return analysis.fieldMatches.find(
            match => {

                if (
                    !match
                ) {
                    return false;
                }

                if (
                    match.vaultKey &&
                    field.vaultKey &&
                    match.vaultKey ===
                    field.vaultKey
                ) {
                    return true;
                }

                if (
                    match.id &&
                    selectors.includes(
                        match.id
                    )
                ) {
                    return true;
                }

                if (
                    field.fieldType &&
                    field.fieldType ===
                    match.vaultKey
                ) {
                    return true;
                }

                return false;
            }
        ) || null;
    }


    function maskValue(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "Not available";
        }

        const raw =
            String(value).trim();

        if (!raw) {
            return "Not available";
        }

        if (raw.length <= 2) {
            return "*".repeat(raw.length);
        }

        return `${raw[0]}${"*".repeat(
            Math.max(4, raw.length - 2)
        )}${raw.slice(-1)}`;
    }


    function showProtectedFieldNotice(
        field,
        match
    ) {

        const title =
            (field.title || field.fieldLabel || field.label || "This field") +
            " is protected";

        const info =
            document.createElement(
                "div"
            );

        info.className =
            "pagedelta-field-info";

        info.innerHTML = `
            <div class="pagedelta-field-name">${title}</div>
            <div class="pagedelta-field-status">Protected</div>
            <div class="pagedelta-field-note">PageDelta will not automatically fill or save protected values.</div>
        `;

        content.appendChild(
            info
        );
    }


    async function saveMissingFieldValue(
        field,
        value
    ) {

        if (
            !field ||
            !value ||
            !value.trim()
        ) {
            return false;
        }

        const vaultApi =
            PAGEDELTA &&
            PAGEDELTA.STORAGE &&
            PAGEDELTA.STORAGE.informationVault;

        const key =
            field.vaultKey ||
            field.fieldType ||
            field.type ||
            null;

        if (
            !vaultApi ||
            !key ||
            typeof vaultApi.updateVault !==
            "function"
        ) {
            return false;
        }

        const result =
            await vaultApi.updateVault({
                [key]: value.trim()
            });

        return !!(
            result &&
            result.success
        );
    }


    function fillFieldValue(
        field,
        value
    ) {

        if (!field || value === undefined || value === null) {
            return false;
        }

        const selectors = [
            field.selector,
            field.id ? `#${CSS.escape(field.id)}` : "",
            field.name ? `[name="${field.name}"]` : "",
            field.name ? `[name='${field.name}']` : ""
        ].filter(Boolean);

        let target = null;

        for (const selector of selectors) {
            try {
                const found =
                    document.querySelector(
                        selector
                    );

                if (found) {
                    target = found;
                    break;
                }
            } catch (error) {
                // Ignore invalid selectors.
            }
        }

        if (!target) {
            return false;
        }

        target.value = String(value);

        try {
            target.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );
        } catch (error) {
            // Ignore event errors.
        }

        try {
            target.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );
        } catch (error) {
            // Ignore event errors.
        }

        return true;
    }


    function fillAvailableMatches(
        analysis
    ) {

        if (!analysis || !Array.isArray(analysis.fieldMatches)) {
            return 0;
        }

        let filled = 0;

        analysis.fieldMatches.forEach(
            match => {

                if (
                    !match ||
                    match.protected ||
                    !match.hasValue
                ) {
                    return;
                }

                const matchField =
                    analysis.fields &&
                    Array.isArray(
                        analysis.fields
                    )
                        ? analysis.fields.find(
                            field => {
                                const selectors = [
                                    field.selector,
                                    field.id,
                                    field.name,
                                    field.label,
                                    field.placeholder
                                ].filter(Boolean);

                                return match.id &&
                                    selectors.includes(
                                        match.id
                                    );
                            }
                        )
                        : null;

                if (
                    matchField &&
                    fillFieldValue(
                        matchField,
                        match.value
                    )
                ) {
                    filled += 1;
                }
            }
        );

        return filled;
    }


    function showPermissionPreview(
        analysis,
        availableMatches
    ) {

        if (!analysis) {
            return;
        }

        const preview =
            createSection(
                "Review information"
            );

        const list =
            document.createElement(
                "div"
            );

        list.className =
            "pagedelta-field-list";

        const rows =
            Array.isArray(
                availableMatches
            ) && availableMatches.length
                ? availableMatches
                : Array.isArray(
                    analysis.fieldMatches
                )
                    ? analysis.fieldMatches.filter(
                        match =>
                            match &&
                            match.hasValue &&
                            !match.protected
                    )
                    : [];

        rows.forEach(
            match => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "pagedelta-field-item";

                const title =
                    document.createElement(
                        "div"
                    );

                title.className =
                    "pagedelta-field-name";

                title.textContent =
                    `${match.label || "Information"} → ${maskValue(match.value)}`;

                row.appendChild(
                    title
                );

                list.appendChild(
                    row
                );
            }
        );

        preview.appendChild(
            list
        );

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "pagedelta-action-row";

        const cancel =
            createButton(
                "Cancel",
                "secondary"
            );

        cancel.addEventListener(
            "click",
            () => {
                updateFloatingPanel(
                    analysis
                );
            }
        );

        const fill =
            createButton(
                "Allow & Fill",
                "primary"
            );

        fill.addEventListener(
            "click",
            () => {
                const filled =
                    fillAvailableMatches(
                        analysis
                    );

                const message =
                    filled
                        ? "PageDelta filled the available fields."
                        : "No fields were filled.";

                showPanelMessage(
                    message,
                    filled ? "success" : "info"
                );
            }
        );

        actions.appendChild(
            cancel
        );

        actions.appendChild(
            fill
        );

        preview.appendChild(
            actions
        );

        content.appendChild(
            preview
        );
    }


    function showMissingFieldPrompt(
        field,
        match
    ) {

        const prompt =
            createSection(
                `Enter ${
                    field.title ||
                    field.fieldLabel ||
                    field.label ||
                    "Information"
                }`
            );

        const note =
            document.createElement(
                "p"
            );

        note.textContent =
            `${
                field.title ||
                field.fieldLabel ||
                field.label ||
                "This information"
            } is required by this page.`;

        const input =
            document.createElement(
                "input"
            );

        input.type =
            "text";

        input.placeholder =
            field.title ||
            field.fieldLabel ||
            field.label ||
            "Enter value";

        input.className =
            "pagedelta-inline-input";

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "pagedelta-action-row";

        const saveButton =
            createButton(
                "Save for future use",
                "primary"
            );

        saveButton.addEventListener(
            "click",
            async () => {
                const value =
                    input.value.trim();

                if (!value) {
                    return;
                }

                const saved =
                    await saveMissingFieldValue(
                        field,
                        value
                    );

                if (saved) {
                    fillFieldValue(
                        field,
                        value
                    );
                    showPanelMessage(
                        "Saved and filled this information.",
                        "success"
                    );
                }
            }
        );

        const useOnceButton =
            createButton(
                "Use once",
                "secondary"
            );

        useOnceButton.addEventListener(
            "click",
            () => {
                const value =
                    input.value.trim();

                if (!value) {
                    return;
                }

                fillFieldValue(
                    field,
                    value
                );
                showPanelMessage(
                    "Used this value once for this page.",
                    "info"
                );
            }
        );

        const cancelButton =
            createButton(
                "Cancel",
                "secondary"
            );

        cancelButton.addEventListener(
            "click",
            () => {
                updateFloatingPanel(
                    PAGEDELTA_CONTENT.lastAnalysis
                );
            }
        );

        actions.appendChild(
            saveButton
        );

        actions.appendChild(
            useOnceButton
        );

        actions.appendChild(
            cancelButton
        );

        prompt.appendChild(
            note
        );

        prompt.appendChild(
            input
        );

        prompt.appendChild(
            actions
        );

        content.appendChild(
            prompt
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


    globalThis.fillAvailableMatches =
        fillAvailableMatches;


    globalThis.showPermissionPreview =
        showPermissionPreview;


    globalThis.showMissingFieldPrompt =
        showMissingFieldPrompt;


    globalThis.showPanelLoading =
        showPanelLoading;


    globalThis.showPanelMessage =
        showPanelMessage;


    console.log(
        "[PageDelta] Purpose-aware floating panel loaded."
    );

})();