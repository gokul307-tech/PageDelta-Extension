/*
 * PageDelta
 * Action Mapping Engine
 */

const ACTION_DESCRIPTIONS = {

    submit:
        "Submit the current form.",

    register:
        "Complete the registration process.",

    login:
        "Sign in to the website.",

    apply:
        "Submit an application.",

    download:
        "Download the available file.",

    upload:
        "Upload the requested file.",

    purchase:
        "Continue with the purchase.",

    book:
        "Continue with the booking.",

    contact:
        "Contact the organization or service."
};


function mapActions(
    actions,
    analysis
) {

    if (!Array.isArray(actions)) {
        return [];
    }


    return actions.map(action => {

        const type =
            action.type || "unknown";


        return {

            ...action,

            description:
                ACTION_DESCRIPTIONS[type] ||
                "Perform the detected action.",

            priority:
                getActionPriority(
                    type,
                    analysis
                ),

            safe:
                isActionSafe(type),

            requiresUserConfirmation:
                requiresConfirmation(type)
        };
    });
}


function getActionPriority(
    type,
    analysis
) {

    if (
        type === "submit" ||
        type === "purchase"
    ) {
        return "high";
    }


    if (
        type === "apply" ||
        type === "register" ||
        type === "book"
    ) {
        return "medium";
    }


    return "low";
}


function isActionSafe(
    type
) {

    /*
     * PageDelta should never silently
     * perform important external actions.
     */
    const unsafeActions = [

        "submit",
        "purchase",
        "apply",
        "book",
        "register"
    ];


    return !unsafeActions.includes(type);
}


function requiresConfirmation(
    type
) {

    return [
        "submit",
        "purchase",
        "apply",
        "book",
        "register",
        "login"
    ].includes(type);
}


if (typeof globalThis !== "undefined") {

    globalThis.ACTION_DESCRIPTIONS =
        ACTION_DESCRIPTIONS;

    globalThis.mapActions =
        mapActions;

    globalThis.getActionPriority =
        getActionPriority;

    globalThis.isActionSafe =
        isActionSafe;

    globalThis.requiresConfirmation =
        requiresConfirmation;
}