/**
 * PageDelta - Personal Information Vault
 *
 * Stores user-provided non-sensitive personal information
 * locally using chrome.storage.local.
 *
 * IMPORTANT:
 * This module:
 *
 * - stores information only
 * - never submits forms
 * - never automatically shares information
 * - never stores passwords, OTPs, card details, PINs,
 *   banking information, or government IDs
 */

(function () {

    "use strict";


    /*
     * --------------------------------------------------
     * Namespace
     * --------------------------------------------------
     */

    if (
        typeof PAGEDELTA ===
        "undefined"
    ) {

        globalThis.PAGEDELTA = {};
    }


    if (
        !PAGEDELTA.STORAGE
    ) {

        PAGEDELTA.STORAGE = {};
    }


    /*
     * --------------------------------------------------
     * Storage key
     * --------------------------------------------------
     *
     * Reuse the existing PageDelta storage contract.
     *
     * If constants.js is not available, use the
     * backward-compatible fallback key.
     */

    const VAULT_KEY =
        PAGEDELTA.STORAGE_KEYS &&
        PAGEDELTA.STORAGE_KEYS.PROFILE
            ? PAGEDELTA.STORAGE_KEYS.PROFILE
            : "pagedelta_profile";


    /*
     * --------------------------------------------------
     * Legacy key
     * --------------------------------------------------
     *
     * Your previous implementation used this key.
     * We keep it temporarily so existing saved data
     * isn't silently lost.
     */

    const LEGACY_VAULT_KEY =
        "pagedelta_information_vault";


    /*
     * --------------------------------------------------
     * Allowed information
     * --------------------------------------------------
     */

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

        "skills",
        "customInformation"

    ];


    /*
     * --------------------------------------------------
     * Protected fields
     * --------------------------------------------------
     */

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


    /*
     * --------------------------------------------------
     * Empty vault
     * --------------------------------------------------
     */

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

            skills: "",
            customInformation: "",

            updatedAt: null

        };
    }


    /*
     * --------------------------------------------------
     * Sanitize vault data
     * --------------------------------------------------
     */

    function sanitizeVaultData(
        data
    ) {

        const cleanData =
            createEmptyVault();


        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return cleanData;
        }


        ALLOWED_FIELDS.forEach(
            field => {

                if (
                    !Object.prototype.hasOwnProperty.call(
                        data,
                        field
                    )
                ) {

                    return;
                }


                const value =
                    data[field];


                if (
                    typeof value ===
                    "string"
                ) {

                    cleanData[field] =
                        value.trim();

                } else if (
                    value !== null &&
                    value !== undefined
                ) {

                    cleanData[field] =
                        String(
                            value
                        ).trim();
                }

            }
        );


        cleanData.updatedAt =
            new Date().toISOString();


        return cleanData;
    }


    /*
     * --------------------------------------------------
     * Read vault
     * --------------------------------------------------
     */

    async function getVault() {

        try {

            const result =
                await chrome.storage.local.get(
                    [
                        VAULT_KEY,
                        LEGACY_VAULT_KEY
                    ]
                );


            /*
             * Current storage.
             */

            if (
                result &&
                result[VAULT_KEY]
            ) {

                return {

                    ...createEmptyVault(),

                    ...result[
                        VAULT_KEY
                    ]

                };
            }


            /*
             * Legacy storage migration.
             */

            if (
                result &&
                result[
                    LEGACY_VAULT_KEY
                ]
            ) {

                const migrated =
                    sanitizeVaultData(
                        result[
                            LEGACY_VAULT_KEY
                        ]
                    );


                await chrome.storage.local.set({

                    [VAULT_KEY]:
                        migrated

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


    /*
     * --------------------------------------------------
     * Save vault
     * --------------------------------------------------
     */

    async function saveVault(
        data
    ) {

        try {

            const sanitizedData =
                sanitizeVaultData(
                    data
                );


            await chrome.storage.local.set({

                [VAULT_KEY]:
                    sanitizedData

            });


            return {

                success:
                    true,

                data:
                    sanitizedData

            };

        } catch (error) {

            console.error(
                "[PageDelta] Failed to save information vault:",
                error
            );


            return {

                success:
                    false,

                error:
                    error.message

            };
        }
    }


    /*
     * --------------------------------------------------
     * Update selected fields
     * --------------------------------------------------
     */

    async function updateVault(
        updates
    ) {

        const currentVault =
            await getVault();


        const updatedVault = {

            ...currentVault,

            ...updates

        };


        return saveVault(
            updatedVault
        );
    }


    /*
     * --------------------------------------------------
     * Clear vault
     * --------------------------------------------------
     */

    async function clearVault() {

        try {

            await chrome.storage.local.remove(
                [
                    VAULT_KEY,
                    LEGACY_VAULT_KEY
                ]
            );


            return {

                success:
                    true

            };

        } catch (error) {

            console.error(
                "[PageDelta] Failed to clear information vault:",
                error
            );


            return {

                success:
                    false,

                error:
                    error.message

            };
        }
    }


    /*
     * --------------------------------------------------
     * Field checks
     * --------------------------------------------------
     */

    function isAllowedField(
        fieldName
    ) {

        return ALLOWED_FIELDS.includes(
            fieldName
        );
    }


    function isProtectedField(
        fieldName
    ) {

        if (!fieldName) {
            return false;
        }


        const normalized =
            String(
                fieldName
            )
                .replace(
                    /[-_\s]/g,
                    ""
                )
                .toLowerCase();


        return PROTECTED_FIELDS.some(
            field => {

                const normalizedField =
                    field
                        .replace(
                            /[-_\s]/g,
                            ""
                        )
                        .toLowerCase();


                return (
                    normalizedField ===
                    normalized
                );
            }
        );
    }


    /*
     * --------------------------------------------------
     * Available information
     * --------------------------------------------------
     */

    async function getAvailableInformation() {

        const vault =
            await getVault();


        const available =
            {};


        ALLOWED_FIELDS.forEach(
            field => {

                if (
                    vault[field] !==
                    undefined &&
                    vault[field] !==
                    null &&
                    String(
                        vault[field]
                    ).trim() !== ""
                ) {

                    available[field] =
                        vault[field];
                }

            }
        );


        return available;
    }


    /*
     * --------------------------------------------------
     * Public API
     * --------------------------------------------------
     */

    PAGEDELTA.STORAGE.informationVault = {

        KEY:
            VAULT_KEY,

        ALLOWED_FIELDS:
            [...ALLOWED_FIELDS],

        PROTECTED_FIELDS:
            [...PROTECTED_FIELDS],

        createEmptyVault,

        getVault,

        saveVault,

        updateVault,

        clearVault,

        isAllowedField,

        isProtectedField,

        getAvailableInformation

    };


    console.log(
        "[PageDelta] Information Vault loaded."
    );

})();