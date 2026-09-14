/*
 * PageDelta
 * Snapshot Manager
 *
 * Creates, compares and manages page snapshots.
 */

async function createSnapshot(
    analysis
) {

    if (!analysis) {
        return null;
    }


    const snapshot =
        normalizeSnapshot(
            analysis
        );


    snapshot.id =
        generateSnapshotId(
            snapshot.url
        );


    snapshot.createdAt =
        Date.now();


    return snapshot;
}


function generateSnapshotId(
    url
) {

    const input =
        String(url || "") +
        Date.now();


    let hash = 0;


    for (
        let i = 0;
        i < input.length;
        i++
    ) {

        hash =
            (
                (
                    hash << 5
                ) -
                hash
            ) +
            input.charCodeAt(i);

        hash |= 0;
    }


    return (
        "snapshot-" +
        Math.abs(hash)
    );
}


async function compareSnapshot(
    oldSnapshot,
    analysis
) {

    if (!analysis) {
        return null;
    }


    return detectChanges(
        oldSnapshot,
        analysis
    );
}


function getSnapshotSummary(
    snapshot
) {

    if (!snapshot) {

        return {

            url: "",

            title: "",

            timestamp: null,

            fields: 0,

            headings: 0,

            deadlines: 0,

            requirements: 0,

            prices: 0
        };
    }


    return {

        url:
            snapshot.url || "",

        title:
            snapshot.title || "",

        timestamp:
            snapshot.timestamp ||
            snapshot.createdAt ||
            null,

        fields:
            Array.isArray(
                snapshot.fields
            )
                ? snapshot.fields.length
                : 0,

        headings:
            Array.isArray(
                snapshot.headings
            )
                ? snapshot.headings.length
                : 0,

        deadlines:
            Array.isArray(
                snapshot.deadlines
            )
                ? snapshot.deadlines.length
                : 0,

        requirements:
            Array.isArray(
                snapshot.requirements
            )
                ? snapshot.requirements.length
                : 0,

        prices:
            Array.isArray(
                snapshot.prices
            )
                ? snapshot.prices.length
                : 0
    };
}


if (typeof globalThis !== "undefined") {

    globalThis.createSnapshot =
        createSnapshot;

    globalThis.generateSnapshotId =
        generateSnapshotId;

    globalThis.compareSnapshot =
        compareSnapshot;

    globalThis.getSnapshotSummary =
        getSnapshotSummary;
}