/*
 * PageDelta
 * Main Change Detector
 */

function detectChanges(
    oldSnapshot,
    newAnalysis
) {

    if (!newAnalysis) {

        return {

            changed: false,

            reason:
                "No new page analysis available."
        };
    }


    const newSnapshot =
        normalizeSnapshot(
            newAnalysis
        );


    /*
     * If there is no previous snapshot,
     * this is the first visit.
     */
    if (!oldSnapshot) {

        return {

            changed: false,

            firstSnapshot: true,

            previous: null,

            current:
                newSnapshot,

            importance: {
                score: 0,
                level: "low",
                reasons: []
            }
        };
    }


    const changes = {

        text:
            compareText(
                oldSnapshot.pageText,
                newSnapshot.pageText
            ),

        headings:
            compareHeadings(
                oldSnapshot.headings,
                newSnapshot.headings
            ),

        fields:
            compareFields(
                oldSnapshot.fields,
                newSnapshot.fields
            ),

        buttons:
            compareButtons(
                oldSnapshot.buttons,
                newSnapshot.buttons
            ),

        deadlines:
            compareSimpleData(
                oldSnapshot.deadlines,
                newSnapshot.deadlines
            ),

        prices:
            compareSimpleData(
                oldSnapshot.prices,
                newSnapshot.prices
            ),

        requirements:
            compareSimpleData(
                oldSnapshot.requirements,
                newSnapshot.requirements
            ),

        contacts:
            compareSimpleData(
                oldSnapshot.contacts,
                newSnapshot.contacts
            ),

        keywords:
            compareSimpleData(
                oldSnapshot.keywords,
                newSnapshot.keywords
            )
    };


    const importance =
        calculateChangeImportance(
            changes
        );


    const changed =
        Object.values(changes)
            .some(
                change =>
                    change &&
                    change.changed
            );


    return {

        changed,

        firstSnapshot: false,

        previous:
            oldSnapshot,

        current:
            newSnapshot,

        changes,

        importance
    };
}


function compareSimpleData(
    oldValue,
    newValue
) {

    const oldNormalized =
        JSON.stringify(
            oldValue ?? null
        );


    const newNormalized =
        JSON.stringify(
            newValue ?? null
        );


    return {

        changed:
            oldNormalized !==
            newNormalized,

        before:
            oldValue,

        after:
            newValue
    };
}


function getChangeSummary(
    result
) {

    if (!result) {
        return "No comparison available.";
    }


    if (result.firstSnapshot) {
        return "Initial page snapshot created.";
    }


    if (!result.changed) {
        return "No meaningful changes detected.";
    }


    const reasons =
        result.importance?.reasons ||
        [];


    if (!reasons.length) {
        return "The webpage has changed.";
    }


    return reasons.join(" ");
}


if (typeof globalThis !== "undefined") {

    globalThis.detectChanges =
        detectChanges;

    globalThis.compareSimpleData =
        compareSimpleData;

    globalThis.getChangeSummary =
        getChangeSummary;
}