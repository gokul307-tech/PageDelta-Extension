/**
 * PageDelta - Personal Information Vault
 *
 * Stores user-provided non-sensitive personal information
 * locally using chrome.storage.local.
 *
 * IMPORTANT:
 * - Never stores passwords or authentication secrets.
 * - Never automatically submits forms.
 * - Never automatically shares information.
 * - Protected fields can be detected but their values are
 *   never exposed to the page-analysis/preview layer.
 */

(function () {
    "use strict";

    /* --------------------------------------------------
       Namespace
    -------------------------------------------------- */

    if (typeof PAGEDELTA === "undefined") {
        globalThis.PAGEDELTA = {};
    }

    /*
     * Do not recreate/freeze the PAGEDELTA namespace here.
     * constants.js owns the main namespace.
     */

    if (!PAGEDELTA.STORAGE) {
        PAGEDELTA.STORAGE = {};
    }

    /* --------------------------------------------------
       Storage keys
    -------------------------------------------------- */

    const VAULT_KEY =
        PAGEDELTA.STORAGE_KEYS &&
        PAGEDELTA.STORAGE_KEYS.PROFILE
            ? PAGEDELTA.STORAGE_KEYS.PROFILE
            : "pagedelta_profile";

    const LEGACY_VAULT_KEY =
        "pagedelta_information_vault";

    /* --------------------------------------------------
       Allowed fields
    -------------------------------------------------- */

    const ALLOWED_FIELDS = [
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

        "bloodGroup",
        "skills",
        "customInformation"
    ];

    /* --------------------------------------------------
       Protected fields
    -------------------------------------------------- */

    const PROTECTED_FIELDS = [
        "password",
        "confirmPassword",

        "otp",
        "verificationCode",

        "pin",

        "cvv",
        "cvc",

        "cardNumber",
        "creditCard",
        "debitCard",

        "bankAccount",
        "bankAccountNumber",
        "ifsc",

        "aadhaar",
        "aadhar",

        "pan",

        "passport",

        "drivingLicense",
        "drivingLicence",

        "governmentId",
        "governmentID"
    ];

    /* --------------------------------------------------
       Field labels
    -------------------------------------------------- */

    const FIELD_LABELS = {
        fullName: "Full name",
        firstName: "First name",
        lastName: "Last name",

        email: "Email address",
        phone: "Phone number",

        dateOfBirth: "Date of birth",
        gender: "Gender",

        address: "Address",
        city: "City",
        state: "State",
        country: "Country",
        postalCode: "Postal code",

        college: "College",
        course: "Course",
        department: "Department",
        registrationNumber: "Registration number",

        bloodGroup: "Blood group",
        skills: "Skills",
        customInformation: "Other information"
    };

    /* --------------------------------------------------
       Create empty vault
    -------------------------------------------------- */

    function createEmptyVault() {
        return {
            fullName: "",
            firstName: "",
            lastName: "",

            email: "",
            phone: "",

            dateOfBirth: "",
            gender: "",

            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",

            college: "",
            course: "",
            department: "",
            registrationNumber: "",

            bloodGroup: "",
            skills: "",
            customInformation: "",

            updatedAt: null
        };
    }

    /* --------------------------------------------------
       Sanitize vault
    -------------------------------------------------- */

    function sanitizeVaultData(data) {
        const cleanData = createEmptyVault();

        if (!data || typeof data !== "object") {
            return cleanData;
        }

        ALLOWED_FIELDS.forEach((field) => {
            if (
                !Object.prototype.hasOwnProperty.call(
                    data,
                    field
                )
            ) {
                return;
            }

            const value = data[field];

            if (typeof value === "string") {
                cleanData[field] = value.trim();
            } else if (
                value !== null &&
                value !== undefined
            ) {
                cleanData[field] =
                    String(value).trim();
            }
        });

        cleanData.updatedAt =
            new Date().toISOString();

        return cleanData;
    }

    /* --------------------------------------------------
       Get vault
    -------------------------------------------------- */

    async function getVault() {
        try {
            const result =
                await chrome.storage.local.get([
                    VAULT_KEY,
                    LEGACY_VAULT_KEY
                ]);

            if (
                result &&
                result[VAULT_KEY]
            ) {
                return {
                    ...createEmptyVault(),
                    ...result[VAULT_KEY]
                };
            }

            /* Legacy migration */

            if (
                result &&
                result[LEGACY_VAULT_KEY]
            ) {
                const migrated =
                    sanitizeVaultData(
                        result[LEGACY_VAULT_KEY]
                    );

                await chrome.storage.local.set({
                    [VAULT_KEY]: migrated
                });

                await chrome.storage.local.remove(
                    LEGACY_VAULT_KEY
                );

                return migrated;
            }

            return createEmptyVault();

        } catch (error) {
            console.error(
                "[PageDelta] Failed to read information vault:",
                error
            );

            return createEmptyVault();
        }
    }

    /* --------------------------------------------------
       Save vault
    -------------------------------------------------- */

    async function saveVault(data) {
        try {
            const sanitizedData =
                sanitizeVaultData(data);

            await chrome.storage.local.set({
                [VAULT_KEY]: sanitizedData
            });

            return {
                success: true,
                data: sanitizedData
            };

        } catch (error) {
            console.error(
                "[PageDelta] Failed to save information vault:",
                error
            );

            return {
                success: false,
                error: error.message
            };
        }
    }

    /* --------------------------------------------------
       Update vault
    -------------------------------------------------- */

    async function updateVault(updates) {
        const currentVault =
            await getVault();

        const updatedVault = {
            ...currentVault,
            ...updates
        };

        return saveVault(updatedVault);
    }

    /* --------------------------------------------------
       Clear vault
    -------------------------------------------------- */

    async function clearVault() {
        try {
            await chrome.storage.local.remove([
                VAULT_KEY,
                LEGACY_VAULT_KEY
            ]);

            return {
                success: true
            };

        } catch (error) {
            console.error(
                "[PageDelta] Failed to clear information vault:",
                error
            );

            return {
                success: false,
                error: error.message
            };
        }
    }

    /* --------------------------------------------------
       Field checks
    -------------------------------------------------- */

    function isAllowedField(fieldName) {
        return ALLOWED_FIELDS.includes(
            fieldName
        );
    }

    function normalizeFieldName(fieldName) {
        return String(fieldName || "")
            .replace(/[-_\s]/g, "")
            .toLowerCase();
    }

    function isProtectedField(fieldName) {
        if (!fieldName) {
            return false;
        }

        const normalized =
            normalizeFieldName(fieldName);

        return PROTECTED_FIELDS.some(
            (field) =>
                normalizeFieldName(field) ===
                normalized
        );
    }

    /* --------------------------------------------------
       Available information
    -------------------------------------------------- */

    async function getAvailableInformation() {
        const vault =
            await getVault();

        const available = {};

        ALLOWED_FIELDS.forEach((field) => {
            const value = vault[field];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                available[field] = value;
            }
        });

        return available;
    }

    /* --------------------------------------------------
       Get a single vault value
    -------------------------------------------------- */

    async function getFieldValue(fieldName) {
        if (!isAllowedField(fieldName)) {
            return null;
        }

        if (isProtectedField(fieldName)) {
            return null;
        }

        const vault =
            await getVault();

        const value =
            vault[fieldName];

        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return null;
        }

        return String(value).trim();
    }

    /* --------------------------------------------------
       Match detected field to vault
       -------------------------------------------------- */

    async function matchFieldToVault(field) {
        if (!field || typeof field !== "object") {
            return {
                matched: false,
                protected: false,
                vaultKey: null,
                value: null
            };
        }

        const vaultKey =
            field.vaultKey ||
            field.fieldType ||
            field.type ||
            null;

        if (!vaultKey) {
            return {
                matched: false,
                protected: false,
                vaultKey: null,
                value: null
            };
        }

        /*
         * Protected fields are deliberately prevented
         * from retrieving a value.
         */

        if (
            field.protected ||
            isProtectedField(vaultKey)
        ) {
            return {
                matched: false,
                protected: true,
                vaultKey,
                value: null
            };
        }

        if (!isAllowedField(vaultKey)) {
            return {
                matched: false,
                protected: false,
                vaultKey,
                value: null
            };
        }

        const value =
            await getFieldValue(vaultKey);

        return {
            matched:
                value !== null,

            protected: false,

            vaultKey,

            value
        };
    }

    /* --------------------------------------------------
       Build permission preview
    -------------------------------------------------- */

    async function buildFieldPermissionPreview(
        fields
    ) {
        if (!Array.isArray(fields)) {
            return [];
        }

        const preview = [];

        for (const field of fields) {
            const match =
                await matchFieldToVault(field);

            const vaultKey =
                match.vaultKey;

            const label =
                field.label ||
                field.fieldLabel ||
                FIELD_LABELS[vaultKey] ||
                "Other information";

            preview.push({
                id:
                    field.id ||
                    field.elementId ||
                    field.name ||
                    `${vaultKey || "field"}-${preview.length}`,

                label,

                type:
                    field.type ||
                    null,

                vaultKey,

                required:
                    Boolean(
                        field.required
                    ),

                optional:
                    !Boolean(
                        field.required
                    ),

                matched:
                    match.matched,

                protected:
                    match.protected,

                /*
                 * Never expose a protected value.
                 */

                value:
                    match.protected
                        ? null
                        : match.value,

                hasValue:
                    Boolean(
                        match.matched
                    ),

                status:
                    match.protected
                        ? "protected"
                        : match.matched
                            ? "available"
                            : "missing"
            });
        }

        return preview;
    }

    /* --------------------------------------------------
       Public API
    -------------------------------------------------- */

    PAGEDELTA.STORAGE.informationVault = {
        KEY: VAULT_KEY,

        ALLOWED_FIELDS: [
            ...ALLOWED_FIELDS
        ],

        PROTECTED_FIELDS: [
            ...PROTECTED_FIELDS
        ],

        FIELD_LABELS: {
            ...FIELD_LABELS
        },

        createEmptyVault,

        getVault,

        saveVault,

        updateVault,

        clearVault,

        isAllowedField,

        isProtectedField,

        getAvailableInformation,

        getFieldValue,

        matchFieldToVault,

        buildFieldPermissionPreview
    };

    console.log(
        "[PageDelta] Information Vault loaded."
    );

})();