/*
 * PageDelta
 * Sensitive Data Detector
 */

const SENSITIVE_DATA_TYPES = {
    EMAIL: "email",
    PHONE: "phone",
    PASSWORD: "password",
    CREDIT_CARD: "credit_card",
    API_KEY: "api_key",
    ACCESS_TOKEN: "access_token",
    AUTHORIZATION: "authorization",
    ADDRESS: "address"
};


const SENSITIVE_PATTERNS = {

    email:
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,

    phone:
        /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4}\b/g,

    password:
        /\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi,

    credit_card:
        /\b(?:\d[ -]*?){13,19}\b/g,

    api_key:
        /\b(?:api[_-]?key|apikey)\s*[:=]\s*[A-Za-z0-9_\-]+/gi,

    access_token:
        /\b(?:access[_-]?token|auth[_-]?token|bearer)\s*[:=]\s*[A-Za-z0-9._\-]+/gi,

    authorization:
        /\bAuthorization\s*[:=]\s*[^\s]+/gi
};


/*
 * Detect sensitive information in text.
 */
function detectSensitiveData(
    text
) {

    const source =
        String(text || "");

    const results = [];


    Object.entries(
        SENSITIVE_PATTERNS
    ).forEach(
        ([type, pattern]) => {

            const matches =
                source.match(pattern);


            if (!matches) {
                return;
            }


            matches.forEach(
                match => {

                    results.push({

                        type,

                        value:
                            maskSensitiveValue(
                                match,
                                type
                            ),

                        length:
                            match.length
                    });
                }
            );
        }
    );


    return removeDuplicateSensitiveData(
        results
    );
}


/*
 * Check whether text contains
 * sensitive information.
 */
function containsSensitiveData(
    text
) {

    return (
        detectSensitiveData(
            text
        ).length > 0
    );
}


/*
 * Detect sensitive fields in forms.
 */
function detectSensitiveFields(
    fields
) {

    if (!Array.isArray(fields)) {
        return [];
    }


    const results = [];


    fields.forEach(
        field => {

            if (!field) {
                return;
            }


            const combined =
                [
                    field.name,
                    field.id,
                    field.type,
                    field.placeholder,
                    field.label,
                    field.ariaLabel
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


            let type = null;


            if (
                field.type ===
                "password" ||
                /\bpassword\b/.test(
                    combined
                )
            ) {

                type =
                    SENSITIVE_DATA_TYPES
                        .PASSWORD;

            } else if (
                /\b(card|credit.?card|debit.?card)\b/
                    .test(combined)
            ) {

                type =
                    SENSITIVE_DATA_TYPES
                        .CREDIT_CARD;

            } else if (
                /\b(token|api.?key|secret)\b/
                    .test(combined)
            ) {

                type =
                    SENSITIVE_DATA_TYPES
                        .API_KEY;
            }


            if (type) {

                results.push({

                    type,

                    field: {
                        name:
                            field.name || "",

                        id:
                            field.id || "",

                        type:
                            field.type || "",

                        label:
                            field.label || "",

                        placeholder:
                            field.placeholder || ""
                    }
                });
            }
        }
    );


    return results;
}


/*
 * Replace sensitive information
 * with a safe placeholder.
 */
function maskSensitiveValue(
    value,
    type
) {

    if (!value) {
        return "";
    }


    switch (type) {

        case SENSITIVE_DATA_TYPES.EMAIL:
            return "[EMAIL_REDACTED]";

        case SENSITIVE_DATA_TYPES.PHONE:
            return "[PHONE_REDACTED]";

        case SENSITIVE_DATA_TYPES.PASSWORD:
            return "[PASSWORD_REDACTED]";

        case SENSITIVE_DATA_TYPES.CREDIT_CARD:
            return "[CARD_REDACTED]";

        case SENSITIVE_DATA_TYPES.API_KEY:
            return "[API_KEY_REDACTED]";

        case SENSITIVE_DATA_TYPES.ACCESS_TOKEN:
            return "[TOKEN_REDACTED]";

        case SENSITIVE_DATA_TYPES.AUTHORIZATION:
            return "[AUTHORIZATION_REDACTED]";

        default:
            return "[SENSITIVE_DATA_REDACTED]";
    }
}


function redactSensitiveData(
    text
) {

    let result =
        String(text || "");


    Object.entries(
        SENSITIVE_PATTERNS
    ).forEach(
        ([type, pattern]) => {

            result =
                result.replace(
                    pattern,
                    () =>
                        maskSensitiveValue(
                            "x",
                            type
                        )
                );
        }
    );


    return result;
}


function removeDuplicateSensitiveData(
    items
) {

    const seen =
        new Set();


    return items.filter(
        item => {

            const key =
                `${item.type}:${item.value}`;


            if (seen.has(key)) {
                return false;
            }


            seen.add(key);

            return true;
        }
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.SENSITIVE_DATA_TYPES =
        SENSITIVE_DATA_TYPES;

    globalThis.detectSensitiveData =
        detectSensitiveData;

    globalThis.containsSensitiveData =
        containsSensitiveData;

    globalThis.detectSensitiveFields =
        detectSensitiveFields;

    globalThis.maskSensitiveValue =
        maskSensitiveValue;

    globalThis.redactSensitiveData =
        redactSensitiveData;
}