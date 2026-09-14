/*
 * PageDelta
 * Reminder Manager
 */

const REMINDER_STORAGE_KEY =
    "pagedelta_reminders";


async function createReminder(
    actionId,
    reminderTime,
    message = ""
) {

    if (
        !actionId ||
        !reminderTime
    ) {
        return null;
    }


    const timestamp =
        Number(reminderTime);


    if (
        !Number.isFinite(timestamp)
    ) {
        return null;
    }


    if (
        timestamp <= Date.now()
    ) {
        return null;
    }


    const reminders =
        await storageGet(
            REMINDER_STORAGE_KEY,
            []
        );


    const reminder = {

        id:
            generateReminderId(),

        actionId,

        message:
            message ||
            "PageDelta reminder",

        reminderTime:
            timestamp,

        createdAt:
            Date.now(),

        triggered:
            false,

        dismissed:
            false
    };


    reminders.push(
        reminder
    );


    await storageSet(
        REMINDER_STORAGE_KEY,
        reminders
    );


    return reminder;
}


async function getReminders(
    options = {}
) {

    const reminders =
        await storageGet(
            REMINDER_STORAGE_KEY,
            []
        );


    let result = [
        ...reminders
    ];


    if (
        options.actionId
    ) {

        result =
            result.filter(
                reminder =>
                    reminder.actionId ===
                    options.actionId
            );
    }


    if (
        options.active
    ) {

        result =
            result.filter(
                reminder =>
                    !reminder.triggered &&
                    !reminder.dismissed
            );
    }


    return result;
}


async function getDueReminders() {

    const reminders =
        await getReminders({
            active: true
        });


    const now =
        Date.now();


    return reminders.filter(
        reminder =>
            reminder.reminderTime <=
            now
    );
}


async function markReminderTriggered(
    reminderId
) {

    const reminders =
        await storageGet(
            REMINDER_STORAGE_KEY,
            []
        );


    const index =
        reminders.findIndex(
            reminder =>
                reminder.id ===
                reminderId
        );


    if (index === -1) {
        return false;
    }


    reminders[index] = {

        ...reminders[index],

        triggered:
            true,

        triggeredAt:
            Date.now()
    };


    await storageSet(
        REMINDER_STORAGE_KEY,
        reminders
    );


    return true;
}


async function dismissReminder(
    reminderId
) {

    const reminders =
        await storageGet(
            REMINDER_STORAGE_KEY,
            []
        );


    const index =
        reminders.findIndex(
            reminder =>
                reminder.id ===
                reminderId
        );


    if (index === -1) {
        return false;
    }


    reminders[index] = {

        ...reminders[index],

        dismissed:
            true,

        dismissedAt:
            Date.now()
    };


    await storageSet(
        REMINDER_STORAGE_KEY,
        reminders
    );


    return true;
}


async function deleteReminder(
    reminderId
) {

    const reminders =
        await storageGet(
            REMINDER_STORAGE_KEY,
            []
        );


    const filtered =
        reminders.filter(
            reminder =>
                reminder.id !==
                reminderId
        );


    await storageSet(
        REMINDER_STORAGE_KEY,
        filtered
    );


    return true;
}


async function clearReminders() {

    await storageRemove(
        REMINDER_STORAGE_KEY
    );

    return true;
}


function generateReminderId() {

    return (
        "reminder-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.REMINDER_STORAGE_KEY =
        REMINDER_STORAGE_KEY;

    globalThis.createReminder =
        createReminder;

    globalThis.getReminders =
        getReminders;

    globalThis.getDueReminders =
        getDueReminders;

    globalThis.markReminderTriggered =
        markReminderTriggered;

    globalThis.dismissReminder =
        dismissReminder;

    globalThis.deleteReminder =
        deleteReminder;

    globalThis.clearReminders =
        clearReminders;
}