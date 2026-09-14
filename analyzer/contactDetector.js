/*
 * PageDelta
 * Contact Information Detector
 */

const EMAIL_PATTERN =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;


const PHONE_PATTERN =
    /(?:\+?\d[\d\s().-]{7,}\d)/g;


function detectContacts(
    text = extractPageText()
) {

    if (!text) {
        return {

            emails: [],

            phones: []
        };
    }


    const emails =
        Array.from(
            new Set(
                (
                    text.match(
                        EMAIL_PATTERN
                    ) || []
                )
                    .map(
                        email =>
                            email.trim()
                    )
            )
        );


    const phones =
        Array.from(
            new Set(
                (
                    text.match(
                        PHONE_PATTERN
                    ) || []
                )
                    .map(
                        phone =>
                            cleanPhone(
                                phone
                            )
                    )
                    .filter(
                        phone =>
                            phone.length >= 8
                    )
            )
        );


    return {

        emails,

        phones
    };
}


function cleanPhone(
    value
) {

    return String(value)
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


function detectEmailAddresses(
    text
) {

    return detectContacts(
        text
    ).emails;
}


function detectPhoneNumbers(
    text
) {

    return detectContacts(
        text
    ).phones;
}


if (typeof globalThis !== "undefined") {

    globalThis.detectContacts =
        detectContacts;

    globalThis.detectEmailAddresses =
        detectEmailAddresses;

    globalThis.detectPhoneNumbers =
        detectPhoneNumbers;
}