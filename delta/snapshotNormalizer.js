/*
 * PageDelta
 * Snapshot Normalizer
 *
 * Converts page analysis into a stable structure
 * that can be compared with future snapshots.
 */

function normalizeSnapshot(analysis) {

    if (!analysis) {
        return null;
    }

    return {
        url: analysis.url || "",
        title: cleanSnapshotText(
            analysis.title || ""
        ),

        metadata: normalizeMetadata(
            analysis.metadata
        ),

        headings: normalizeHeadings(
            analysis.headings
        ),

        pageText: cleanSnapshotText(
            analysis.pageText || ""
        ),

        fields: normalizeFields(
            analysis.fields
        ),

        buttons: normalizeButtons(
            analysis.buttons
        ),

        deadlines: normalizeSimpleArray(
            analysis.deadlines
        ),

        prices: normalizeSimpleArray(
            analysis.prices
        ),

        requirements: normalizeSimpleArray(
            analysis.requirements
        ),

        contacts: normalizeContacts(
            analysis.contacts
        ),

        keywords: normalizeKeywords(
            analysis.keywords
        ),

        timestamp:
            Number(analysis.timestamp) ||
            Date.now()
    };
}


function normalizeMetadata(metadata) {

    if (!metadata) {
        return {};
    }

    return {
        title: cleanSnapshotText(
            metadata.title || ""
        ),

        description: cleanSnapshotText(
            metadata.description || ""
        ),

        keywords: cleanSnapshotText(
            metadata.keywords || ""
        ),

        author: cleanSnapshotText(
            metadata.author || ""
        ),

        language:
            metadata.language || "",

        canonical:
            metadata.canonical || "",

        ogTitle:
            cleanSnapshotText(
                metadata.ogTitle || ""
            ),

        ogDescription:
            cleanSnapshotText(
                metadata.ogDescription || ""
            ),

        ogType:
            metadata.ogType || ""
    };
}


function normalizeHeadings(headings) {

    if (!Array.isArray(headings)) {
        return [];
    }

    return headings.map(
        heading => ({
            level:
                Number(
                    heading.level || 0
                ),

            text:
                cleanSnapshotText(
                    heading.text || ""
                )
        })
    );
}


function normalizeFields(fields) {

    if (!Array.isArray(fields)) {
        return [];
    }

    return fields.map(field => ({
        tag:
            field.tag || "",

        type:
            field.type || "",

        name:
            field.name || "",

        id:
            field.id || "",

        placeholder:
            cleanSnapshotText(
                field.placeholder || ""
            ),

        ariaLabel:
            cleanSnapshotText(
                field.ariaLabel || ""
            ),

        label:
            cleanSnapshotText(
                field.label || ""
            ),

        fieldType:
            field.fieldType || "",

        required:
            Boolean(field.required),

        disabled:
            Boolean(field.disabled)
    }));
}


function normalizeButtons(buttons) {

    if (!Array.isArray(buttons)) {
        return [];
    }

    return buttons.map(button => ({
        text:
            cleanSnapshotText(
                button.text || ""
            ),

        type:
            button.type || "",

        ariaLabel:
            cleanSnapshotText(
                button.ariaLabel || ""
            )
    }));
}


function normalizeSimpleArray(items) {

    if (!Array.isArray(items)) {
        return [];
    }

    return items.map(item => {

        if (
            typeof item ===
            "string"
        ) {
            return cleanSnapshotText(
                item
            );
        }

        return normalizeObject(
            item
        );
    });
}


function normalizeContacts(contacts) {

    if (!contacts) {
        return {
            emails: [],
            phones: []
        };
    }

    return {
        emails:
            Array.isArray(
                contacts.emails
            )
                ? [
                    ...contacts.emails
                ].sort()
                : [],

        phones:
            Array.isArray(
                contacts.phones
            )
                ? [
                    ...contacts.phones
                ].sort()
                : []
    };
}


function normalizeKeywords(keywords) {

    if (!keywords) {
        return {};
    }

    const result = {};

    Object.keys(keywords)
        .sort()
        .forEach(category => {

            result[category] =
                Array.isArray(
                    keywords[category]
                )
                    ? [
                        ...keywords[
                            category
                        ]
                    ].sort()
                    : [];
        });

    return result;
}


function normalizeObject(object) {

    if (!object) {
        return {};
    }

    const result = {};

    Object.keys(object)
        .sort()
        .forEach(key => {

            const value =
                object[key];

            if (
                typeof value ===
                "string"
            ) {
                result[key] =
                    cleanSnapshotText(
                        value
                    );
            } else {
                result[key] = value;
            }
        });

    return result;
}


function cleanSnapshotText(text) {

    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
}


if (typeof globalThis !== "undefined") {

    globalThis.normalizeSnapshot =
        normalizeSnapshot;

    globalThis.normalizeMetadata =
        normalizeMetadata;

    globalThis.normalizeHeadings =
        normalizeHeadings;

    globalThis.normalizeFields =
        normalizeFields;

    globalThis.normalizeButtons =
        normalizeButtons;
}