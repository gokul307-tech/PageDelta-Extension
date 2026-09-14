/*
 * PageDelta
 * Data Filter
 */

function filterPageData(
    data,
    options = {}
) {

    if (!data) {
        return data;
    }


    const settings = {

        redactText:
            options.redactText !== false,

        removeSensitiveFields:
            options.removeSensitiveFields !== false,

        removePasswords:
            options.removePasswords !== false
    };


    const filtered =
        deepClone(data);


    /*
     * Page text
     */
    if (
        settings.redactText &&
        typeof filtered.pageText ===
        "string"
    ) {

        filtered.pageText =
            redactSensitiveData(
                filtered.pageText
            );
    }


    /*
     * Visible text.
     */
    if (
        Array.isArray(
            filtered.visibleTextElements
        )
    ) {

        filtered.visibleTextElements =
            filtered.visibleTextElements
                .map(item => {

                    if (
                        !item ||
                        typeof item.text !==
                        "string"
                    ) {
                        return item;
                    }


                    return {

                        ...item,

                        text:
                            settings.redactText
                                ? redactSensitiveData(
                                    item.text
                                )
                                : item.text
                    };
                });
    }


    /*
     * Form fields.
     */
    if (
        Array.isArray(
            filtered.fields
        )
    ) {

        filtered.fields =
            filtered.fields.filter(
                field => {

                    if (
                        !settings.removeSensitiveFields
                    ) {
                        return true;
                    }


                    return !isSensitiveField(
                        field,
                        settings
                    );
                }
            );
    }


    /*
     * Remove direct values from
     * sensitive objects.
     */
    if (
        Array.isArray(
            filtered.sensitiveData
        )
    ) {

        filtered.sensitiveData =
            filtered.sensitiveData.map(
                item => ({

                    type:
                        item.type || "",

                    value:
                        "[REDACTED]"
                })
            );
    }


    return filtered;
}


function filterSnapshot(
    snapshot
) {

    if (!snapshot) {
        return null;
    }


    return filterPageData(
        snapshot,
        {
            redactText: true,
            removeSensitiveFields: true,
            removePasswords: true
        }
    );
}


function filterAction(
    action
) {

    if (!action) {
        return null;
    }


    const filtered =
        deepClone(action);


    if (
        typeof filtered.title ===
        "string"
    ) {

        filtered.title =
            redactSensitiveData(
                filtered.title
            );
    }


    if (
        typeof filtered.description ===
        "string"
    ) {

        filtered.description =
            redactSensitiveData(
                filtered.description
            );
    }


    return filtered;
}


function isSensitiveField(
    field,
    options = {}
) {

    if (!field) {
        return false;
    }


    if (
        options.removePasswords !==
        false &&
        String(field.type)
            .toLowerCase() ===
        "password"
    ) {

        return true;
    }


    const combined =
        [
            field.name,
            field.id,
            field.placeholder,
            field.label,
            field.ariaLabel
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


    const sensitiveWords = [

        "password",
        "passwd",
        "credit card",
        "card number",
        "cvv",
        "cvc",
        "security code",
        "api key",
        "access token",
        "secret key",
        "authorization"
    ];


    return sensitiveWords.some(
        word =>
            combined.includes(word)
    );
}


function deepClone(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return value;
    }


    try {

        return JSON.parse(
            JSON.stringify(value)
        );

    } catch (error) {

        return value;
    }
}


if (typeof globalThis !== "undefined") {

    globalThis.filterPageData =
        filterPageData;

    globalThis.filterSnapshot =
        filterSnapshot;

    globalThis.filterAction =
        filterAction;

    globalThis.isSensitiveField =
        isSensitiveField;
}