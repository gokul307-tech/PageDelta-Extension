/*
 * PageDelta
 * Keyword Engine
 */

const PAGEDELTA_KEYWORDS = {

    application: [
        "application",
        "apply",
        "applicant"
    ],

    education: [
        "student",
        "school",
        "college",
        "university",
        "degree",
        "course",
        "exam"
    ],

    employment: [
        "job",
        "career",
        "employment",
        "vacancy",
        "position",
        "resume",
        "interview"
    ],

    registration: [
        "register",
        "registration",
        "sign up",
        "account"
    ],

    payment: [
        "payment",
        "fee",
        "price",
        "cost",
        "pay",
        "checkout"
    ],

    deadline: [
        "deadline",
        "due date",
        "last date",
        "submit by",
        "expires"
    ],

    documents: [
        "document",
        "certificate",
        "proof",
        "upload",
        "attachment"
    ],

    event: [
        "event",
        "conference",
        "workshop",
        "seminar",
        "webinar"
    ],

    travel: [
        "flight",
        "hotel",
        "booking",
        "reservation",
        "travel"
    ]
};


function findKeywords(
    text = extractPageText()
) {

    const normalized =
        normalizeText(text);


    if (!normalized) {
        return {};
    }


    const results = {};


    Object.entries(
        PAGEDELTA_KEYWORDS
    )
        .forEach(
            ([category, keywords]) => {

                const matches =
                    keywords.filter(
                        keyword =>
                            normalized.includes(
                                normalizeText(
                                    keyword
                                )
                            )
                    );


                if (matches.length) {

                    results[category] =
                        matches;
                }
            }
        );


    return results;
}


function getKeywordCategories(
    text
) {

    return Object.keys(
        findKeywords(text)
    );
}


function keywordExists(
    text,
    keyword
) {

    return containsText(
        text,
        keyword
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.PAGEDELTA_KEYWORDS =
        PAGEDELTA_KEYWORDS;

    globalThis.findKeywords =
        findKeywords;

    globalThis.getKeywordCategories =
        getKeywordCategories;

    globalThis.keywordExists =
        keywordExists;
}