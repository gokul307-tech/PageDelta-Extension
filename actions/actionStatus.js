/*
 * PageDelta
 * Action Status
 */

const ACTION_STATUS = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    DISMISSED: "dismissed",
    EXPIRED: "expired"
};


function isValidActionStatus(
    status
) {

    return Object.values(
        ACTION_STATUS
    ).includes(status);
}


function getActionStatusLabel(
    status
) {

    const labels = {

        [ACTION_STATUS.PENDING]:
            "Pending",

        [ACTION_STATUS.IN_PROGRESS]:
            "In Progress",

        [ACTION_STATUS.COMPLETED]:
            "Completed",

        [ACTION_STATUS.DISMISSED]:
            "Dismissed",

        [ACTION_STATUS.EXPIRED]:
            "Expired"
    };


    return (
        labels[status] ||
        "Unknown"
    );
}


function isActionCompleted(
    action
) {

    return Boolean(
        action &&
        action.status ===
        ACTION_STATUS.COMPLETED
    );
}


function isActionActive(
    action
) {

    if (!action) {
        return false;
    }


    return (
        action.status ===
            ACTION_STATUS.PENDING ||
        action.status ===
            ACTION_STATUS.IN_PROGRESS
    );
}


function canCompleteAction(
    action
) {

    if (!action) {
        return false;
    }


    return (
        action.status !==
        ACTION_STATUS.COMPLETED
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.ACTION_STATUS =
        ACTION_STATUS;

    globalThis.isValidActionStatus =
        isValidActionStatus;

    globalThis.getActionStatusLabel =
        getActionStatusLabel;

    globalThis.isActionCompleted =
        isActionCompleted;

    globalThis.isActionActive =
        isActionActive;

    globalThis.canCompleteAction =
        canCompleteAction;
}