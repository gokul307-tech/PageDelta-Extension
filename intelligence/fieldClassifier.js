/*
 * PageDelta
 * Form Field Classification Engine
 *
 * Responsibilities:
 * 1. Understand webpage form fields.
 * 2. Classify them into PageDelta field types.
 * 3. Map them to Information Vault fields.
 * 4. Detect protected/sensitive fields.
 *
 * IMPORTANT:
 * This file DOES NOT fill any webpage fields.
 */

(function () {

    "use strict";


    /*
     * --------------------------------------------------
     * Field definitions
     * --------------------------------------------------
     *
     * vaultKey is the exact field name used by
     * storage/informationVault.js.
     */

    const FIELD_DEFINITIONS = {

        full_name: {
            vaultKey: "fullName",
            label: "Full name",
            patterns: [
                "full name",
                "fullname",
                "applicant name",
                "candidate name",
                "your name"
            ]
        },

        first_name: {
            vaultKey: "firstName",
            label: "First name",
            patterns: [
                "first name",
                "firstname",
                "given name",
                "givenname"
            ]
        },

        last_name: {
            vaultKey: "lastName",
            label: "Last name",
            patterns: [
                "last name",
                "lastname",
                "surname",
                "family name"
            ]
        },

        email: {
            vaultKey: "email",
            label: "Email address",
            patterns: [
                "email",
                "e-mail",
                "email address",
                "emailaddress"
            ]
        },

        phone: {
            vaultKey: "phone",
            label: "Phone number",
            patterns: [
                "phone",
                "phone number",
                "mobile",
                "mobile number",
                "telephone",
                "telephone number",
                "contact number"
            ]
        },

        date_of_birth: {
            vaultKey: "dateOfBirth",
            label: "Date of birth",
            patterns: [
                "date of birth",
                "dateofbirth",
                "dob",
                "birth date",
                "birthdate",
                "birthday"
            ]
        },

        gender: {
            vaultKey: "gender",
            label: "Gender",
            patterns: [
                "gender",
                "sex"
            ]
        },

        address: {
            vaultKey: "address",
            label: "Address",
            patterns: [
                "address",
                "street address",
                "home address",
                "residential address",
                "mailing address",
                "permanent address"
            ]
        },

        city: {
            vaultKey: "city",
            label: "City",
            patterns: [
                "city",
                "town"
            ]
        },

        state: {
            vaultKey: "state",
            label: "State",
            patterns: [
                "state",
                "province",
                "region"
            ]
        },

        country: {
            vaultKey: "country",
            label: "Country",
            patterns: [
                "country",
                "nation"
            ]
        },

        postal_code: {
            vaultKey: "postalCode",
            label: "Postal / PIN code",
            patterns: [
                "zip",
                "zip code",
                "postal",
                "postal code",
                "pincode",
                "pin code",
                "postcode"
            ]
        },

        college: {
            vaultKey: "college",
            label: "College / Institution",
            patterns: [
                "college",
                "college name",
                "institution",
                "institution name",
                "university",
                "university name"
            ]
        },

        course: {
            vaultKey: "course",
            label: "Course",
            patterns: [
                "course",
                "degree",
                "program",
                "programme"
            ]
        },

        department: {
            vaultKey: "department",
            label: "Department",
            patterns: [
                "department",
                "branch",
                "stream",
                "specialization",
                "specialisation"
            ]
        },

        registration_number: {
            vaultKey: "registrationNumber",
            label: "Registration / Roll number",
            patterns: [
                "registration number",
                "registration no",
                "registration id",
                "roll number",
                "roll no",
                "student id",
                "student number",
                "admission number"
            ]
        },

        skills: {
            vaultKey: "skills",
            label: "Skills",
            patterns: [
                "skills",
                "technical skills",
                "skill set",
                "programming skills"
            ]
        },


        /*
         * --------------------------------------------------
         * Protected fields
         * --------------------------------------------------
         *
         * These NEVER receive automatic vault mappings.
         */

        password: {
            vaultKey: null,
            label: "Password",
            protected: true,
            patterns: [
                "password",
                "passwd",
                "passcode",
                "pwd",
                "confirm password",
                "new password",
                "current password"
            ]
        },

        otp: {
            vaultKey: null,
            label: "OTP / Verification code",
            protected: true,
            patterns: [
                "otp",
                "one time password",
                "one-time password",
                "verification code",
                "verification otp",
                "security code"
            ]
        },

        pin: {
            vaultKey: null,
            label: "PIN",
            protected: true,
            patterns: [
                "pin",
                "security pin",
                "transaction pin"
            ]
        },

        card_number: {
            vaultKey: null,
            label: "Card number",
            protected: true,
            patterns: [
                "card number",
                "credit card",
                "credit card number",
                "debit card",
                "debit card number"
            ]
        },

        cvv: {
            vaultKey: null,
            label: "CVV / CVC",
            protected: true,
            patterns: [
                "cvv",
                "cvc",
                "security code on card"
            ]
        },

        bank_account: {
            vaultKey: null,
            label: "Bank account",
            protected: true,
            patterns: [
                "bank account",
                "account number",
                "bank account number"
            ]
        },

        government_id: {
            vaultKey: null,
            label: "Government ID",
            protected: true,
            patterns: [
                "aadhaar",
                "aadhar",
                "pan number",
                "passport number",
                "driving license",
                "driving licence",
                "government id",
                "government identification"
            ]
        },

        username: {
            vaultKey: null,
            label: "Username",
            protected: true,
            patterns: [
                "username",
                "user name",
                "login name",
                "login id"
            ]
        }

    };


    /*
     * --------------------------------------------------
     * Normalization
     * --------------------------------------------------
     */

    function normalizeText(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .toLowerCase()
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }


    /*
     * --------------------------------------------------
     * Build field context
     * --------------------------------------------------
     */

    function getFieldContext(field) {

        if (!field) {
            return "";
        }

        return [
            field.name,
            field.id,
            field.placeholder,
            field.ariaLabel,
            field.label,
            field.context,
            field.autocomplete
        ]
            .filter(Boolean)
            .join(" ");
    }


    /*
     * --------------------------------------------------
     * Keyword matching
     * --------------------------------------------------
     */

    function keywordMatches(
        source,
        keyword
    ) {

        const normalizedSource =
            normalizeText(source);

        const normalizedKeyword =
            normalizeText(keyword);

        if (
            !normalizedSource ||
            !normalizedKeyword
        ) {
            return false;
        }


        /*
         * Word-boundary style matching.
         *
         * Prevents "pin" from accidentally matching
         * unrelated words containing "pin".
         */

        const escaped =
            normalizedKeyword
                .replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );


        const pattern =
            new RegExp(
                `(^|\\s)${escaped}(\\s|$)`,
                "i"
            );


        return (
            normalizedSource ===
            normalizedKeyword
        ) || pattern.test(
            normalizedSource
        );
    }


    /*
     * --------------------------------------------------
     * HTML autocomplete mapping
     * --------------------------------------------------
     */

    const AUTOCOMPLETE_MAP = {

        "name": "full_name",

        "given-name":
            "first_name",

        "family-name":
            "last_name",

        "email":
            "email",

        "tel":
            "phone",

        "bday":
            "date_of_birth",

        "street-address":
            "address",

        "address-level2":
            "city",

        "address-level1":
            "state",

        "country":
            "country",

        "postal-code":
            "postal_code"
    };


    /*
     * --------------------------------------------------
     * Classify one field
     * --------------------------------------------------
     */

    function classifyField(field) {

        if (!field) {

            return {

                type: "unknown",

                label: "Other information",

                vaultKey: null,

                confidence: 0,

                protected: false,

                canUseVault: false,

                matchedKeywords: []
            };
        }


        const context =
            normalizeText(
                getFieldContext(field)
            );


        const htmlType =
            normalizeText(
                field.type
            );


        const autocomplete =
            normalizeText(
                field.autocomplete
            );


        /*
         * --------------------------------------------------
         * Strong protected HTML signals
         * --------------------------------------------------
         */

        if (
            htmlType === "password"
        ) {

            return createClassification(
                "password",
                100,
                [
                    "HTML password input"
                ]
            );
        }


        /*
         * --------------------------------------------------
         * Strong HTML type signals
         * --------------------------------------------------
         */

        if (
            htmlType === "email"
        ) {

            return createClassification(
                "email",
                99,
                [
                    "HTML email input"
                ]
            );
        }


        if (
            htmlType === "tel"
        ) {

            return createClassification(
                "phone",
                99,
                [
                    "HTML telephone input"
                ]
            );
        }


        /*
         * Date input.
         */

        if (
            htmlType === "date"
        ) {

            const dobMatch =
                FIELD_DEFINITIONS
                    .date_of_birth
                    .patterns
                    .find(
                        keyword =>
                            keywordMatches(
                                context,
                                keyword
                            )
                    );


            if (dobMatch) {

                return createClassification(
                    "date_of_birth",
                    99,
                    [
                        dobMatch,
                        "HTML date input"
                    ]
                );
            }


            return createClassification(
                "date",
                90,
                [
                    "HTML date input"
                ]
            );
        }


        /*
         * --------------------------------------------------
         * Autocomplete signal
         * --------------------------------------------------
         */

        if (
            autocomplete &&
            AUTOCOMPLETE_MAP[
                autocomplete
            ]
        ) {

            const type =
                AUTOCOMPLETE_MAP[
                    autocomplete
                ];


            return createClassification(
                type,
                98,
                [
                    `autocomplete="${autocomplete}"`
                ]
            );
        }


        /*
         * --------------------------------------------------
         * Pattern matching
         * --------------------------------------------------
         */

        let bestType =
            "unknown";

        let bestScore =
            0;

        let bestMatches =
            [];


        Object.entries(
            FIELD_DEFINITIONS
        ).forEach(
            ([type, definition]) => {

                const matches =
                    definition.patterns.filter(
                        keyword =>
                            keywordMatches(
                                context,
                                keyword
                            )
                    );


                if (!matches.length) {
                    return;
                }


                let score =
                    45 +
                    matches.length * 10;


                /*
                 * Strong fields:
                 * label, name and id.
                 */

                const strongFields = [

                    field.label,

                    field.name,

                    field.id,

                    field.placeholder,

                    field.ariaLabel

                ]
                    .filter(Boolean)
                    .map(normalizeText);


                matches.forEach(
                    keyword => {

                        const normalizedKeyword =
                            normalizeText(
                                keyword
                            );


                        if (
                            strongFields.some(
                                value =>
                                    value ===
                                    normalizedKeyword
                            )
                        ) {

                            score += 25;
                        }

                    }
                );


                /*
                 * Protected fields get
                 * absolute priority.
                 */

                if (
                    definition.protected
                ) {

                    score += 100;
                }


                /*
                 * Prevent generic "name"
                 * logic from defeating
                 * first/last name.
                 */

                if (
                    type === "full_name" &&
                    (
                        context.includes(
                            "first name"
                        ) ||
                        context.includes(
                            "last name"
                        ) ||
                        context.includes(
                            "surname"
                        )
                    )
                ) {

                    score -= 50;
                }


                score =
                    Math.min(
                        100,
                        score
                    );


                if (
                    score >
                    bestScore
                ) {

                    bestScore =
                        score;

                    bestType =
                        type;

                    bestMatches =
                        matches;
                }

            }
        );


        return createClassification(
            bestType,
            bestScore,
            bestMatches
        );
    }


    /*
     * --------------------------------------------------
     * Create classification result
     * --------------------------------------------------
     */

    function createClassification(
        type,
        confidence,
        matchedKeywords
    ) {

        const definition =
            FIELD_DEFINITIONS[type];


        if (!definition) {

            return {

                type:
                    type || "unknown",

                label:
                    "Other information",

                vaultKey:
                    null,

                confidence:
                    confidence || 0,

                protected:
                    false,

                canUseVault:
                    false,

                matchedKeywords:
                    matchedKeywords || []
            };
        }


        const isProtected =
            definition.protected === true;


        return {

            type,

            label:
                definition.label,

            vaultKey:
                definition.vaultKey ||
                null,

            confidence:
                confidence || 0,

            protected:
                isProtected,

            canUseVault:
                Boolean(
                    definition.vaultKey
                ) &&
                !isProtected,

            matchedKeywords:
                matchedKeywords || []
        };
    }


    /*
     * --------------------------------------------------
     * Classify multiple fields
     * --------------------------------------------------
     */

    function classifyFields(
        fields
    ) {

        if (
            !Array.isArray(fields)
        ) {
            return [];
        }


        return fields.map(
            field => {

                const classification =
                    classifyField(
                        field
                    );


                return {

                    ...field,

                    fieldType:
                        classification.type,

                    fieldLabel:
                        classification.label,

                    vaultKey:
                        classification.vaultKey,

                    confidence:
                        classification.confidence,

                    protected:
                        classification.protected,

                    canUseVault:
                        classification.canUseVault,

                    matchedKeywords:
                        classification.matchedKeywords
                };
            }
        );
    }


    /*
     * --------------------------------------------------
     * Remove duplicate fields
     * --------------------------------------------------
     */

    function getUniqueClassifiedFields(
        fields
    ) {

        const classified =
            classifyFields(
                fields
            );


        const result = [];

        const seen =
            new Set();


        classified.forEach(
            field => {

                const identity = [

                    field.selector,

                    field.id,

                    field.name,

                    field.label,

                    field.placeholder

                ]
                    .filter(Boolean)
                    .join("|");


                if (
                    !identity ||
                    seen.has(identity)
                ) {
                    return;
                }


                seen.add(identity);

                result.push(field);
            }
        );


        return result;
    }


    /*
     * --------------------------------------------------
     * Public API
     * --------------------------------------------------
     */

    globalThis.FIELD_DEFINITIONS =
        FIELD_DEFINITIONS;

    globalThis.FIELD_PATTERNS =
        Object.fromEntries(
            Object.entries(
                FIELD_DEFINITIONS
            ).map(
                ([key, value]) => [
                    key,
                    value.patterns
                ]
            )
        );

    globalThis.FIELD_LABELS =
        Object.fromEntries(
            Object.entries(
                FIELD_DEFINITIONS
            ).map(
                ([key, value]) => [
                    key,
                    value.label
                ]
            )
        );

    globalThis.classifyField =
        classifyField;

    globalThis.classifyFields =
        classifyFields;

    globalThis.getUniqueClassifiedFields =
        getUniqueClassifiedFields;


    console.log(
        "[PageDelta] Secure field classifier loaded."
    );

})();