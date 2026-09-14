/*
 * PageDelta
 * Date utilities
 */

function isValidDate(date) {

    return (
        date instanceof Date &&
        !Number.isNaN(
            date.getTime()
        )
    );
}


function parseDate(value) {

    if (!value) {
        return null;
    }


    if (value instanceof Date) {

        return isValidDate(value)
            ? value
            : null;
    }


    const date =
        new Date(value);


    return isValidDate(date)
        ? date
        : null;
}


function formatDate(
    value
) {

    const date =
        parseDate(value);

    if (!date) {
        return "";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


function formatDateTime(
    value
) {

    const date =
        parseDate(value);

    if (!date) {
        return "";
    }

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


function daysBetween(
    first,
    second
) {

    const firstDate =
        parseDate(first);

    const secondDate =
        parseDate(second);

    if (
        !firstDate ||
        !secondDate
    ) {
        return null;
    }

    const difference =
        secondDate.getTime() -
        firstDate.getTime();

    return Math.round(
        difference /
        (1000 * 60 * 60 * 24)
    );
}


function isPastDate(value) {

    const date =
        parseDate(value);

    if (!date) {
        return false;
    }

    return date.getTime() <
        Date.now();
}


function isFutureDate(value) {

    const date =
        parseDate(value);

    if (!date) {
        return false;
    }

    return date.getTime() >
        Date.now();
}


function isToday(value) {

    const date =
        parseDate(value);

    if (!date) {
        return false;
    }

    const now =
        new Date();

    return (
        date.getFullYear() ===
        now.getFullYear() &&

        date.getMonth() ===
        now.getMonth() &&

        date.getDate() ===
        now.getDate()
    );
}


function startOfDay(value) {

    const date =
        parseDate(value);

    if (!date) {
        return null;
    }

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}


function endOfDay(value) {

    const date =
        parseDate(value);

    if (!date) {
        return null;
    }

    date.setHours(
        23,
        59,
        59,
        999
    );

    return date;
}


function daysUntil(value) {

    return daysBetween(
        new Date(),
        value
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.isValidDate =
        isValidDate;

    globalThis.parseDate =
        parseDate;

    globalThis.formatDate =
        formatDate;

    globalThis.formatDateTime =
        formatDateTime;

    globalThis.daysBetween =
        daysBetween;

    globalThis.isPastDate =
        isPastDate;

    globalThis.isFutureDate =
        isFutureDate;

    globalThis.isToday =
        isToday;

    globalThis.startOfDay =
        startOfDay;

    globalThis.endOfDay =
        endOfDay;

    globalThis.daysUntil =
        daysUntil;
}