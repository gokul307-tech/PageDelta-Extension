/*
 * PageDelta
 * Scheduler
 */

const SCHEDULER_ALARM =
    "pagedelta-scheduler";


async function initializeScheduler() {

    try {

        await chrome.alarms.create(
            SCHEDULER_ALARM,
            {
                periodInMinutes: 1
            }
        );

        console.log(
            "[PageDelta] Scheduler initialized."
        );

    } catch (error) {

        console.error(
            "[PageDelta] Scheduler initialization failed:",
            error
        );
    }
}


async function handleScheduledTask(
    alarm
) {

    if (
        !alarm ||
        alarm.name !==
        SCHEDULER_ALARM
    ) {
        return;
    }

    await processDueReminders();

    await cleanupExpiredCache();
}


async function processDueReminders() {

    try {

        const reminders =
            await getDueReminders();


        for (
            const reminder of reminders
        ) {

            const action =
                await getAction(
                    reminder.actionId
                );


            await notifyReminder(
                reminder,
                action
            );


            await markReminderTriggered(
                reminder.id
            );
        }

    } catch (error) {

        console.error(
            "[PageDelta] Reminder processing failed:",
            error
        );
    }
}


async function cleanupExpiredCache() {

    try {

        const cache =
            await storageGet(
                PAGEDELTA_STORAGE.CACHE,
                {}
            );


        let changed = false;


        Object.keys(cache)
            .forEach(
                key => {

                    const item =
                        cache[key];


                    if (
                        !item ||
                        Date.now() >
                        item.expiresAt
                    ) {

                        delete cache[key];

                        changed = true;
                    }
                }
            );


        if (changed) {

            await storageSet(
                PAGEDELTA_STORAGE.CACHE,
                cache
            );
        }

    } catch (error) {

        console.error(
            "[PageDelta] Cache cleanup failed:",
            error
        );
    }
}


if (typeof globalThis !== "undefined") {

    globalThis.SCHEDULER_ALARM =
        SCHEDULER_ALARM;

    globalThis.initializeScheduler =
        initializeScheduler;

    globalThis.handleScheduledTask =
        handleScheduledTask;

    globalThis.processDueReminders =
        processDueReminders;

    globalThis.cleanupExpiredCache =
        cleanupExpiredCache;
}