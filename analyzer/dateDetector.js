/*
 * PageDelta
 * Date Detector
 */

const DATE_PATTERNS = [

    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,

    /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g,

    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*|\s+)\d{4}\b/gi,

    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/gi,

    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*|\s+)\d{4}\b/gi
];


function detectDates(
    text = extractPageText()
) {

    const results = [];

    if (!text) {
        return results;
    }


    for (
        const pattern of DATE_PATTERNS
    ) {

        const matches =
            text.match(pattern);

        if (!matches) {
            continue;
        }


        matches.forEach(match => {

            const clean =
                cleanText(match);

            if (!clean) {
                return;
            }


            const date =
                parseDate(clean);


            results.push({

                text: clean,

                date:
                    date
                        ? date.toISOString()
                        : null,

                timestamp:
                    date
                        ? date.getTime()
                        : null,

                isPast:
                    date
                        ? isPastDate(date)
                        : false,

                isFuture:
                    date
                        ? isFutureDate(date)
                        : false
            });
        });
    }


    return removeDuplicateDates(
        results
    );
}


function removeDuplicateDates(
    dates
) {

    const seen = new Set();

    return dates.filter(item => {

        const key =
            normalizeText(
                item.text
            );

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);

        return true;
    });
}


if (typeof globalThis !== "undefined") {

    globalThis.detectDates =
        detectDates;
}