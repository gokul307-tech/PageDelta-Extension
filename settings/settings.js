/**
 * PageDelta - Information Vault UI
 */

(function () {
    "use strict";

    const FIELD_NAMES = [
        "fullName",
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "gender",

        "address",
        "city",
        "state",
        "country",
        "postalCode",

        "college",
        "course",
        "department",
        "registrationNumber",

        "skills",
        "customInformation"
    ];

    /**
     * Get an input element by vault field name.
     */
    function getField(fieldName) {
        return document.getElementById(`vault-${fieldName}`);
    }

    /**
     * Populate the form with saved information.
     */
    async function loadInformationVault() {

        if (
            !window.PAGEDELTA ||
            !PAGEDELTA.STORAGE ||
            !PAGEDELTA.STORAGE.informationVault
        ) {
            console.error(
                "PageDelta: Information Vault module is not loaded."
            );
            return;
        }

        const vault =
            await PAGEDELTA.STORAGE.informationVault.getVault();

        FIELD_NAMES.forEach((fieldName) => {

            const element = getField(fieldName);

            if (!element) {
                return;
            }

            element.value = vault[fieldName] || "";
        });
    }

    /**
     * Read all fields from the form.
     */
    function collectInformationVault() {

        const data = {};

        FIELD_NAMES.forEach((fieldName) => {

            const element = getField(fieldName);

            if (!element) {
                return;
            }

            data[fieldName] = element.value.trim();
        });

        return data;
    }

    /**
     * Show a temporary status message.
     */
    function showVaultStatus(message, type) {

        const status =
            document.getElementById("vault-save-status");

        if (!status) {
            return;
        }

        status.textContent = message;

        status.className = `save-status ${type}`;

        setTimeout(() => {
            status.textContent = "";
            status.className = "save-status";
        }, 3000);
    }

    /**
     * Save vault.
     */
    async function handleVaultSubmit(event) {

        event.preventDefault();

        const vaultData =
            collectInformationVault();

        const result =
            await PAGEDELTA.STORAGE.informationVault
                .saveVault(vaultData);

        if (result.success) {

            showVaultStatus(
                "Information saved locally.",
                "success"
            );

        } else {

            showVaultStatus(
                "Unable to save information.",
                "error"
            );

            console.error(
                "PageDelta vault error:",
                result.error
            );
        }
    }

    /**
     * Clear vault.
     */
    async function handleVaultClear() {

        const confirmed = window.confirm(
            "Are you sure you want to remove all saved personal information from PageDelta?"
        );

        if (!confirmed) {
            return;
        }

        const result =
            await PAGEDELTA.STORAGE.informationVault
                .clearVault();

        if (!result.success) {

            showVaultStatus(
                "Unable to clear information.",
                "error"
            );

            return;
        }

        FIELD_NAMES.forEach((fieldName) => {

            const element = getField(fieldName);

            if (element) {
                element.value = "";
            }
        });

        showVaultStatus(
            "Personal information removed.",
            "success"
        );
    }

    /**
     * Initialize vault UI.
     */
    async function initializeInformationVault() {

        const form =
            document.getElementById(
                "information-vault-form"
            );

        const clearButton =
            document.getElementById(
                "clear-vault-button"
            );

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            handleVaultSubmit
        );

        if (clearButton) {
            clearButton.addEventListener(
                "click",
                handleVaultClear
            );
        }

        await loadInformationVault();
    }

    /**
     * Wait until DOM is ready.
     */
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeInformationVault
        );

    } else {

        initializeInformationVault();
    }

})();