/*
 * PageDelta
 * Snapshot Storage
 */

async function saveSnapshot(
    snapshot
) {

    if (
        !snapshot ||
        !snapshot.url
    ) {
        return false;
    }


    const snapshots =
        await storageGet(
            PAGEDELTA_STORAGE.SNAPSHOTS,
            {}
        );


    const pageKey =
        createPageKey(
            snapshot.url
        );


    if (
        !Array.isArray(
            snapshots[pageKey]
        )
    ) {

        snapshots[pageKey] = [];
    }


    snapshots[pageKey].push(
        snapshot
    );


    /*
     * Keep only the latest snapshots.
     */
    const maxSnapshots =
        getMaxSnapshots();


    if (
        snapshots[pageKey].length >
        maxSnapshots
    ) {

        snapshots[pageKey] =
            snapshots[pageKey]
                .slice(
                    -maxSnapshots
                );
    }


    await storageSet(
        PAGEDELTA_STORAGE.SNAPSHOTS,
        snapshots
    );


    return true;
}


async function getLatestSnapshot(
    url
) {

    const history =
        await getSnapshotHistory(
            url
        );


    if (!history.length) {
        return null;
    }


    return history[
        history.length - 1
    ];
}


async function getSnapshotHistory(
    url
) {

    if (!url) {
        return [];
    }


    const snapshots =
        await storageGet(
            PAGEDELTA_STORAGE.SNAPSHOTS,
            {}
        );


    const pageKey =
        createPageKey(url);


    return Array.isArray(
        snapshots[pageKey]
    )
        ? snapshots[pageKey]
        : [];
}


async function deleteSnapshots(
    url
) {

    if (!url) {
        return false;
    }


    const snapshots =
        await storageGet(
            PAGEDELTA_STORAGE.SNAPSHOTS,
            {}
        );


    const pageKey =
        createPageKey(url);


    if (!snapshots[pageKey]) {
        return false;
    }


    delete snapshots[pageKey];


    await storageSet(
        PAGEDELTA_STORAGE.SNAPSHOTS,
        snapshots
    );


    return true;
}


async function clearAllSnapshots() {

    await storageRemove(
        PAGEDELTA_STORAGE.SNAPSHOTS
    );

    return true;
}


function getMaxSnapshots() {

    if (
        typeof PAGEDELTA !==
        "undefined" &&
        PAGEDELTA.LIMITS
    ) {

        return (
            PAGEDELTA.LIMITS
                .MAX_SNAPSHOTS_PER_PAGE ||
            10
        );
    }


    return 10;
}


if (typeof globalThis !== "undefined") {

    globalThis.saveSnapshot =
        saveSnapshot;

    globalThis.getLatestSnapshot =
        getLatestSnapshot;

    globalThis.getSnapshotHistory =
        getSnapshotHistory;

    globalThis.deleteSnapshots =
        deleteSnapshots;

    globalThis.clearAllSnapshots =
        clearAllSnapshots;
}