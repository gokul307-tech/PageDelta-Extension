/*
 * PageDelta
 * Deadline Detector
 */

const DEADLINE_KEYWORDS = [

    "deadline",

    "last date",

    "due date",

    "due by",

    "submit by",

    "submission deadline",

    "application deadline",

    "registration deadline",

    "closing date",

    "ends on",

    "expires on",

    "expiry date",

    "final date",

    "last day",

    "must submit",

    "submit before",

    "apply before",

    "apply by"
];


function detectDeadlines(
    text = extractPageText()
) {

    const results = [];

    if (!text) {
        return results;
    }


    const dates =
        typeof detectDates ===
        "function"
            ? detectDates(text)
            : [];


    dates.forEach(date => {

        const context =
            getDateContext(
                text,
                date.text
            );


        const normalized =
            normalizeText(
                context
            );


        const matchedKeywords =
            DEADLINE_KEYWORDS.filter(
                keyword =>
                    normalized.includes(
                        normalizeText(
                            keyword
                        )
                    )
            );


        if (
            matchedKeywords.length === 0
        ) {
            return;
        }


        results.push({

            date:
                date.text,

            parsedDate:
                date.date,

            context,

            keywords:
                matchedKeywords,

            importance:
                "high",

            isPast:
                date.isPast,

            isFuture:
                date.isFuture
        });
    });


    return results;
}


function getDateContext(
    text,
    dateText,
    radius = 150
) {

    const normalizedText =
        String(text);

    const index =
        normalizedText
            .toLowerCase()
            .indexOf(
                String(dateText)
                    .toLowerCase()
            );


    if (index === -1) {
        return dateText;
    }


    const start =
        Math.max(
            0,
            index - radius
        );


    const end =
        Math.min(
            normalizedText.length,
            index +
            dateText.length +
            radius
        );


    return cleanText(
        normalizedText.substring(
            start,
            end
        )
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.detectDeadlines =
        detectDeadlines;

    globalThis.getDateContext =
        getDateContext;
}