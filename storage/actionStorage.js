/*
 * PageDelta
 * Action Storage
 */

async function saveAction(
    action,
    url = ""
) {

    if (!action) {
        return false;
    }


    const actions =
        await storageGet(
            PAGEDELTA_STORAGE.ACTIONS,
            []
        );


    const storedAction = {

        ...action,

        pageUrl:
            url ||
            action.pageUrl ||
            "",

        createdAt:
            action.createdAt ||
            Date.now(),

        updatedAt:
            Date.now()
    };


    actions.push(
        storedAction
    );


    const maxActions = 500;


    const trimmed =
        actions.slice(
            -maxActions
        );


    await storageSet(
        PAGEDELTA_STORAGE.ACTIONS,
        trimmed
    );


    return true;
}


async function getActions(
    options = {}
) {

    const actions =
        await storageGet(
            PAGEDELTA_STORAGE.ACTIONS,
            []
        );


    let result = [
        ...actions
    ];


    if (options.url) {

        result =
            result.filter(
                action =>
                    action.pageUrl ===
                    options.url
            );
    }


    if (
        options.type
    ) {

        result =
            result.filter(
                action =>
                    action.type ===
                    options.type
            );
    }


    if (
        options.completed !==
        undefined
    ) {

        result =
            result.filter(
                action =>
                    Boolean(
                        action.completed
                    ) ===
                    Boolean(
                        options.completed
                    )
            );
    }


    return result;
}


async function updateAction(
    actionId,
    updates
) {

    if (
        !actionId ||
        !updates
    ) {
        return false;
    }


    const actions =
        await storageGet(
            PAGEDELTA_STORAGE.ACTIONS,
            []
        );


    const index =
        actions.findIndex(
            action =>
                action.id ===
                actionId
        );


    if (index === -1) {
        return false;
    }


    actions[index] = {

        ...actions[index],

        ...updates,

        updatedAt:
            Date.now()
    };


    await storageSet(
        PAGEDELTA_STORAGE.ACTIONS,
        actions
    );


    return true;
}


async function deleteAction(
    actionId
) {

    if (!actionId) {
        return false;
    }


    const actions =
        await storageGet(
            PAGEDELTA_STORAGE.ACTIONS,
            []
        );


    const filtered =
        actions.filter(
            action =>
                action.id !==
                actionId
        );


    await storageSet(
        PAGEDELTA_STORAGE.ACTIONS,
        filtered
    );


    return true;
}


async function clearActions() {

    await storageRemove(
        PAGEDELTA_STORAGE.ACTIONS
    );

    return true;
}


if (typeof globalThis !== "undefined") {

    globalThis.saveAction =
        saveAction;

    globalThis.getActions =
        getActions;

    globalThis.updateAction =
        updateAction;

    globalThis.deleteAction =
        deleteAction;

    globalThis.clearActions =
        clearActions;
}