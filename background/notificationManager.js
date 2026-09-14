/*
 * PageDelta
 * Notification Manager
 */

const NOTIFICATION_PREFIX =
    "pagedelta-notification-";


async function showNotification(
    options = {}
) {

    const settings =
        await getSettings();

    if (
        settings.notifications ===
        false
    ) {
        return false;
    }

    const id =
        options.id ||
        generateNotificationId();

    const title =
        options.title ||
        "PageDelta";

    const message =
        options.message ||
        "PageDelta found something important.";

    const notificationOptions = {

        type: "basic",

        iconUrl:
            options.iconUrl ||
            "assets/icons/icon128.png",

        title,

        message,

        priority:
            Number(
                options.priority
            ) || 0
    };


    try {

        await chrome.notifications.create(
            id,
            notificationOptions
        );

        return true;

    } catch (error) {

        console.error(
            "[PageDelta] Notification failed:",
            error
        );

        return false;
    }
}


async function notifyDeadline(
    deadline
) {

    if (!deadline) {
        return false;
    }

    const title =
        deadline.title ||
        "Upcoming deadline";

    const message =
        deadline.description ||
        deadline.text ||
        "A deadline was detected on this page.";

    return showNotification({

        id:
            `${NOTIFICATION_PREFIX}deadline-${Date.now()}`,

        title,

        message,

        priority: 2
    });
}


async function notifyImportantChange(
    change
) {

    if (!change) {
        return false;
    }

    return showNotification({

        id:
            `${NOTIFICATION_PREFIX}change-${Date.now()}`,

        title:
            "Important page change",

        message:
            change.summary ||
            change.message ||
            "PageDelta detected an important change.",

        priority: 1
    });
}


async function notifyReminder(
    reminder,
    action
) {

    if (!reminder) {
        return false;
    }

    return showNotification({

        id:
            `${NOTIFICATION_PREFIX}reminder-${reminder.id}`,

        title:
            "PageDelta Reminder",

        message:
            reminder.message ||
            action?.title ||
            "You have a pending action.",

        priority: 2
    });
}


function generateNotificationId() {

    return (
        NOTIFICATION_PREFIX +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.showNotification =
        showNotification;

    globalThis.notifyDeadline =
        notifyDeadline;

    globalThis.notifyImportantChange =
        notifyImportantChange;

    globalThis.notifyReminder =
        notifyReminder;
}