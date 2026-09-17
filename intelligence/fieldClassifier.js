/*
 * PageDelta
 * Form Field Classification Engine
 *
 * Converts raw HTML form fields into meaningful,
 * human-readable field types.
 */

(function () {

    "use strict";


    const FIELD_PATTERNS = {

        full_name: [
            "full name",
            "fullname",
            "applicant name",
            "candidate name",
            "your name",
            "name"
        ],

        first_name: [
            "first name",
            "firstname",
            "given name",
            "givenname"
        ],

        last_name: [
            "last name",
            "lastname",
            "surname",
            "family name"
        ],

        email: [
            "email",
            "e-mail",
            "email address",
            "emailaddress"
        ],

        phone: [
            "phone",
            "phone number",
            "mobile",
            "mobile number",
            "telephone",
            "telephone number",
            "contact number"
        ],

        date_of_birth: [
            "date of birth",
            "dateofbirth",
            "dob",
            "birth date",
            "birthdate",
            "birthday"
        ],

        address: [
            "address",
            "street address",
            "home address",
            "residential address",
            "mailing address",
            "permanent address"
        ],

        city: [
            "city",
            "town"
        ],

        state: [
            "state",
            "province",
            "region"
        ],

        country: [
            "country",
            "nation"
        ],

        postal_code: [
            "zip",
            "zip code",
            "postal",
            "postal code",
            "pincode",
            "pin code",
            "postcode"
        ],

        username: [
            "username",
            "user name",
            "login name",
            "login"
        ],

        password: [
            "password",
            "passcode",
            "confirm password",
            "new password",
            "current password"
        ],

        gender: [
            "gender",
            "sex"
        ],

        age: [
            "age"
        ],

        amount: [
            "amount",
            "price",
            "payment amount"
        ],

        quantity: [
            "quantity",
            "qty"
        ],

        date: [
            "date",
            "start date",
            "end date"
        ]
    };


    const FIELD_LABELS = {

        full_name:
            "Full name",

        first_name:
            "First name",

        last_name:
            "Last name",

        email:
            "Email address",

        phone:
            "Phone number",

        date_of_birth:
            "Date of birth",

        address:
            "Address",

        city:
            "City",

        state:
            "State",

        country:
            "Country",

        postal_code:
            "Postal / PIN code",

        username:
            "Username",

        password:
            "Password",

        gender:
            "Gender",

        age:
            "Age",

        amount:
            "Amount",

        quantity:
            "Quantity",

        date:
            "Date",

        unknown:
            "Other information"
    };


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


    function exactOrContained(
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


        return (
            normalizedSource ===
            normalizedKeyword
        ) ||
        normalizedSource.includes(
            normalizedKeyword
        );
    }


    function classifyField(field) {

        if (!field) {

            return {

                type:
                    "unknown",

                label:
                    FIELD_LABELS.unknown,

                confidence:
                    0,

                matchedKeywords:
                    []
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


        /*
         * Strong HTML signals.
         */

        if (
            htmlType ===
            "email"
        ) {

            return {

                type:
                    "email",

                label:
                    FIELD_LABELS.email,

                confidence:
                    99,

                matchedKeywords:
                    [
                        "HTML email input"
                    ]
            };
        }


        if (
            htmlType ===
            "tel"
        ) {

            return {

                type:
                    "phone",

                label:
                    FIELD_LABELS.phone,

                confidence:
                    99,

                matchedKeywords:
                    [
                        "HTML telephone input"
                    ]
            };
        }


        if (
            htmlType ===
            "password"
        ) {

            return {

                type:
                    "password",

                label:
                    FIELD_LABELS.password,

                confidence:
                    100,

                matchedKeywords:
                    [
                        "HTML password input"
                    ]
            };
        }


        if (
            htmlType ===
            "date"
        ) {

            /*
             * A date input could specifically be
             * a date of birth, so inspect its
             * surrounding field context first.
             */

            const dobKeywords =
                FIELD_PATTERNS.date_of_birth;


            const dobMatch =
                dobKeywords.find(
                    keyword =>
                        exactOrContained(
                            context,
                            keyword
                        )
                );


            if (dobMatch) {

                return {

                    type:
                        "date_of_birth",

                    label:
                        FIELD_LABELS.date_of_birth,

                    confidence:
                        99,

                    matchedKeywords:
                        [
                            dobMatch,
                            "HTML date input"
                        ]
                };
            }


            return {

                type:
                    "date",

                label:
                    FIELD_LABELS.date,

                confidence:
                    96,

                matchedKeywords:
                    [
                        "HTML date input"
                    ]
            };
        }


        /*
         * Select / checkbox / radio still use
         * textual classification.
         */

        let bestType =
            "unknown";

        let bestScore =
            0;

        let bestMatches =
            [];


        Object.entries(
            FIELD_PATTERNS
        ).forEach(
            ([type, keywords]) => {

                const matches =
                    keywords.filter(
                        keyword =>
                            exactOrContained(
                                context,
                                keyword
                            )
                    );


                if (!matches.length) {
                    return;
                }


                let score =
                    45 +
                    matches.length * 12;


                /*
                 * Give the actual label/name/id
                 * additional weight.
                 */

                const strongFields = [

                    field.label,

                    field.name,

                    field.id,

                    field.placeholder,

                    field.ariaLabel

                ]
                    .filter(Boolean)
                    .map(
                        normalizeText
                    );


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
                 * Avoid generic "name" defeating
                 * "first name" or "last name".
                 */

                if (
                    type ===
                    "full_name" &&
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

                    score -= 35;
                }


                score =
                    Math.min(
                        99,
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


        return {

            type:
                bestType,

            label:
                FIELD_LABELS[
                    bestType
                ] ||
                FIELD_LABELS.unknown,

            confidence:
                bestScore,

            matchedKeywords:
                bestMatches
        };
    }


    function classifyFields(
        fields
    ) {

        if (
            !Array.isArray(
                fields
            )
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

                    confidence:
                        classification.confidence,

                    matchedKeywords:
                        classification.matchedKeywords
                };
            }
        );
    }


    /*
     * Remove duplicate classifications.
     *
     * Example:
     *
     * name="name"
     * id="full-name"
     * label="Full Name"
     *
     * should still represent one field.
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
                    seen.has(
                        identity
                    )
                ) {
                    return;
                }


                seen.add(
                    identity
                );


                result.push(
                    field
                );
            }
        );


        return result;
    }


    globalThis.FIELD_PATTERNS =
        FIELD_PATTERNS;


    globalThis.FIELD_LABELS =
        FIELD_LABELS;


    globalThis.classifyField =
        classifyField;


    globalThis.classifyFields =
        classifyFields;


    globalThis.getUniqueClassifiedFields =
        getUniqueClassifiedFields;


    console.log(
        "[PageDelta] Enhanced field classifier loaded."
    );

})();