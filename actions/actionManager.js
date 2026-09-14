/*
 * PageDelta
 * Action Manager
 */

async function createAction(
    actionData
) {

    if (!actionData) {
        return null;
    }


    const action = {

        id:
            generateActionId(),

        type:
            actionData.type ||
            "general",

        title:
            actionData.title ||
            "New Action",

        description:
            actionData.description ||
            "",

        url:
            actionData.url ||
            "",

        source:
            actionData.source ||
            "pagedelta",

        importance:
            actionData.importance ||
            "medium",

        status:
            ACTION_STATUS.PENDING,

        deadline:
            actionData.deadline ||
            null,

        reminder:
            actionData.reminder ||
            null,

        metadata:
            actionData.metadata ||
            {},

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()
    };


    await saveAction(
        action,
        action.url
    );


    return action;
}


async function getAction(
    actionId
) {

    if (!actionId) {
        return null;
    }


    const actions =
        await getActions();


    return (
        actions.find(
            action =>
                action.id ===
                actionId
        ) ||
        null
    );
}


async function completeAction(
    actionId
) {

    const action =
        await getAction(
            actionId
        );


    if (!action) {
        return false;
    }


    if (
        !canCompleteAction(
            action
        )
    ) {
        return false;
    }


    await updateAction(
        actionId,
        {
            status:
                ACTION_STATUS.COMPLETED,

            completedAt:
                Date.now()
        }
    );


    await recordActionHistory(
        action,
        "completed"
    );


    return true;
}


async function dismissAction(
    actionId
) {

    const action =
        await getAction(
            actionId
        );


    if (!action) {
        return false;
    }


    await updateAction(
        actionId,
        {
            status:
                ACTION_STATUS.DISMISSED,

            dismissedAt:
                Date.now()
        }
    );


    await recordActionHistory(
        action,
        "dismissed"
    );


    return true;
}


async function startAction(
    actionId
) {

    const action =
        await getAction(
            actionId
        );


    if (!action) {
        return false;
    }


    await updateAction(
        actionId,
        {
            status:
                ACTION_STATUS.IN_PROGRESS
        }
    );


    await recordActionHistory(
        action,
        "started"
    );


    return true;
}


async function reopenAction(
    actionId
) {

    const action =
        await getAction(
            actionId
        );


    if (!action) {
        return false;
    }


    await updateAction(
        actionId,
        {
            status:
                ACTION_STATUS.PENDING,

            completedAt:
                null,

            dismissedAt:
                null
        }
    );


    await recordActionHistory(
        action,
        "reopened"
    );


    return true;
}


async function getActiveActions() {

    const actions =
        await getActions();


    return actions.filter(
        action =>
            isActionActive(
                action
            )
    );
}


async function getCompletedActions() {

    const actions =
        await getActions();


    return actions.filter(
        action =>
            isActionCompleted(
                action
            )
    );
}


async function deleteActionAndHistory(
    actionId
) {

    await deleteAction(
        actionId
    );


    await deleteActionHistory(
        actionId
    );


    return true;
}


function generateActionId() {

    return (
        "action-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.createAction =
        createAction;

    globalThis.getAction =
        getAction;

    globalThis.completeAction =
        completeAction;

    globalThis.dismissAction =
        dismissAction;

    globalThis.startAction =
        startAction;

    globalThis.reopenAction =
        reopenAction;

    globalThis.getActiveActions =
        getActiveActions;

    globalThis.getCompletedActions =
        getCompletedActions;

    globalThis.deleteActionAndHistory =
        deleteActionAndHistory;

    globalThis.generateActionId =
        generateActionId;
}