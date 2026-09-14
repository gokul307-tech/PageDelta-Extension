/*
 * PageDelta
 * Action History
 */

const ACTION_HISTORY_KEY =
    "pagedelta_action_history";


async function recordActionHistory(
    action,
    event
) {

    if (!action) {
        return false;
    }


    const history =
        await storageGet(
            ACTION_HISTORY_KEY,
            []
        );


    history.push({

        id:
            generateHistoryId(),

        actionId:
            action.id,

        event:
            event || "unknown",

        title:
            action.title || "",

        url:
            action.url || "",

        timestamp:
            Date.now()
    });


    /*
     * Keep the latest 1000 entries.
     */
    const trimmed =
        history.slice(
            -1000
        );


    await storageSet(
        ACTION_HISTORY_KEY,
        trimmed
    );


    return true;
}


async function getActionHistory(
    actionId = null
) {

    const history =
        await storageGet(
            ACTION_HISTORY_KEY,
            []
        );


    if (!actionId) {
        return history;
    }


    return history.filter(
        item =>
            item.actionId ===
            actionId
    );
}


async function getRecentActionHistory(
    limit = 50
) {

    const history =
        await storageGet(
            ACTION_HISTORY_KEY,
            []
        );


    return history.slice(
        -Math.max(
            1,
            Number(limit) || 50
        )
    );
}


async function deleteActionHistory(
    actionId
) {

    if (!actionId) {
        return false;
    }


    const history =
        await storageGet(
            ACTION_HISTORY_KEY,
            []
        );


    const filtered =
        history.filter(
            item =>
                item.actionId !==
                actionId
        );


    await storageSet(
        ACTION_HISTORY_KEY,
        filtered
    );


    return true;
}


async function clearActionHistory() {

    await storageRemove(
        ACTION_HISTORY_KEY
    );

    return true;
}


function generateHistoryId() {

    return (
        "history-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.ACTION_HISTORY_KEY =
        ACTION_HISTORY_KEY;

    globalThis.recordActionHistory =
        recordActionHistory;

    globalThis.getActionHistory =
        getActionHistory;

    globalThis.getRecentActionHistory =
        getRecentActionHistory;

    globalThis.deleteActionHistory =
        deleteActionHistory;

    globalThis.clearActionHistory =
        clearActionHistory;
}