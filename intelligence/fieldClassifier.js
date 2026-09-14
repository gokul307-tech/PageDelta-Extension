/*
 * PageDelta
 * Form Field Classification Engine
 */

const FIELD_PATTERNS = {

    name: [
        "name",
        "full name",
        "first name",
        "last name",
        "surname",
        "given name"
    ],

    email: [
        "email",
        "e-mail",
        "email address"
    ],

    phone: [
        "phone",
        "mobile",
        "mobile number",
        "telephone",
        "contact number"
    ],

    address: [
        "address",
        "street address",
        "home address",
        "residential address"
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
        "pin code"
    ],

    username: [
        "username",
        "user name",
        "login name"
    ],

    password: [
        "password",
        "passcode",
        "confirm password"
    ],

    date: [
        "date",
        "date of birth",
        "dob",
        "birth date",
        "start date",
        "end date"
    ],

    number: [
        "number",
        "quantity",
        "age",
        "amount"
    ]
};


function classifyField(field) {

    if (!field) {

        return {
            type: "unknown",
            confidence: 0,
            matchedKeywords: []
        };
    }


    const context = normalizeText(
        [
            field.name,
            field.id,
            field.placeholder,
            field.ariaLabel,
            field.label,
            field.context
        ]
            .filter(Boolean)
            .join(" ")
    );


    /*
     * HTML input type gives us
     * an additional strong signal.
     */
    const htmlType =
        normalizeText(
            field.type || ""
        );


    if (htmlType === "email") {

        return {
            type: "email",
            confidence: 98,
            matchedKeywords: ["html:type=email"]
        };
    }


    if (htmlType === "password") {

        return {
            type: "password",
            confidence: 98,
            matchedKeywords: ["html:type=password"]
        };
    }


    if (htmlType === "tel") {

        return {
            type: "phone",
            confidence: 95,
            matchedKeywords: ["html:type=tel"]
        };
    }


    if (htmlType === "date") {

        return {
            type: "date",
            confidence: 98,
            matchedKeywords: ["html:type=date"]
        };
    }


    let bestType = "unknown";
    let bestScore = 0;
    let matchedKeywords = [];


    Object.entries(FIELD_PATTERNS)
        .forEach(([type, keywords]) => {

            const matches =
                keywords.filter(keyword =>
                    context.includes(
                        normalizeText(keyword)
                    )
                );


            if (!matches.length) {
                return;
            }


            let score =
                Math.min(
                    90,
                    40 + matches.length * 15
                );


            /*
             * Exact label/name matches are
             * stronger than surrounding text.
             */
            const strongFields = [
                field.name,
                field.id,
                field.label,
                field.placeholder
            ]
                .filter(Boolean)
                .map(normalizeText);


            if (
                matches.some(keyword =>
                    strongFields.some(value =>
                        value ===
                        normalizeText(keyword)
                    )
                )
            ) {
                score += 10;
            }


            if (score > bestScore) {

                bestScore = score;
                bestType = type;
                matchedKeywords = matches;
            }
        });


    return {

        type: bestType,

        confidence:
            Math.min(100, bestScore),

        matchedKeywords
    };
}


function classifyFields(fields) {

    if (!Array.isArray(fields)) {
        return [];
    }


    return fields.map(field => {

        const classification =
            classifyField(field);


        return {

            ...field,

            fieldType:
                classification.type,

            confidence:
                classification.confidence,

            matchedKeywords:
                classification.matchedKeywords
        };
    });
}


if (typeof globalThis !== "undefined") {

    globalThis.FIELD_PATTERNS =
        FIELD_PATTERNS;

    globalThis.classifyField =
        classifyField;

    globalThis.classifyFields =
        classifyFields;
}