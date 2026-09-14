/*
 * PageDelta
 * Element Difference Engine
 */

function compareElements(
    oldElements = [],
    newElements = [],
    keyFields = ["text"]
) {

    const oldMap =
        createElementMap(
            oldElements,
            keyFields
        );

    const newMap =
        createElementMap(
            newElements,
            keyFields
        );


    const added = [];

    const removed = [];

    const modified = [];


    /*
     * Find added and modified elements.
     */
    Object.keys(newMap)
        .forEach(key => {

            if (!oldMap[key]) {

                added.push(
                    newMap[key]
                );

                return;
            }


            if (
                JSON.stringify(
                    oldMap[key]
                ) !==
                JSON.stringify(
                    newMap[key]
                )
            ) {

                modified.push({

                    before:
                        oldMap[key],

                    after:
                        newMap[key]
                });
            }
        });


    /*
     * Find removed elements.
     */
    Object.keys(oldMap)
        .forEach(key => {

            if (!newMap[key]) {

                removed.push(
                    oldMap[key]
                );
            }
        });


    return {

        changed:
            added.length > 0 ||
            removed.length > 0 ||
            modified.length > 0,

        added,

        removed,

        modified,

        addedCount:
            added.length,

        removedCount:
            removed.length,

        modifiedCount:
            modified.length
    };
}


function createElementMap(
    elements,
    keyFields
) {

    const map = {};

    if (!Array.isArray(elements)) {
        return map;
    }


    elements.forEach(
        (element, index) => {

            const key =
                createElementKey(
                    element,
                    keyFields,
                    index
                );

            map[key] =
                element;
        }
    );


    return map;
}


function createElementKey(
    element,
    keyFields,
    index
) {

    const values =
        keyFields.map(
            field =>
                normalizeElementValue(
                    element?.[field]
                )
        );


    const key =
        values
            .filter(Boolean)
            .join("|");


    return key ||
        `element-${index}`;
}


function normalizeElementValue(
    value
) {

    return String(
        value ?? ""
    )
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


function compareHeadings(
    oldHeadings,
    newHeadings
) {

    return compareElements(
        oldHeadings,
        newHeadings,
        ["level", "text"]
    );
}


function compareFields(
    oldFields,
    newFields
) {

    return compareElements(
        oldFields,
        newFields,
        [
            "type",
            "name",
            "id",
            "label"
        ]
    );
}


function compareButtons(
    oldButtons,
    newButtons
) {

    return compareElements(
        oldButtons,
        newButtons,
        [
            "text",
            "type",
            "ariaLabel"
        ]
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.compareElements =
        compareElements;

    globalThis.compareHeadings =
        compareHeadings;

    globalThis.compareFields =
        compareFields;

    globalThis.compareButtons =
        compareButtons;
}