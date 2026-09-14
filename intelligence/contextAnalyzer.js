/*
 * PageDelta
 * Page Context Analyzer
 */

const CONTEXT_PATTERNS = {

    education: [
        "student",
        "college",
        "university",
        "course",
        "exam",
        "admission",
        "education",
        "scholarship"
    ],

    employment: [
        "job",
        "career",
        "employment",
        "resume",
        "cv",
        "vacancy",
        "position",
        "interview"
    ],

    registration: [
        "register",
        "registration",
        "sign up",
        "create account"
    ],

    shopping: [
        "cart",
        "checkout",
        "buy",
        "purchase",
        "product",
        "shipping"
    ],

    travel: [
        "flight",
        "hotel",
        "booking",
        "reservation",
        "passenger",
        "travel"
    ],

    event: [
        "event",
        "conference",
        "workshop",
        "seminar",
        "webinar",
        "ticket"
    ],

    government: [
        "government",
        "official",
        "application form",
        "citizen",
        "department",
        "ministry"
    ],

    finance: [
        "bank",
        "payment",
        "loan",
        "finance",
        "transaction",
        "account"
    ]
};


function analyzeContext(
    analysis
) {

    if (!analysis) {

        return {
            category: "unknown",
            confidence: 0,
            matches: []
        };
    }


    const text =
        normalizeText(
            analysis.pageText || ""
        );


    const scores = [];


    Object.entries(
        CONTEXT_PATTERNS
    )
        .forEach(
            ([category, keywords]) => {

                const matches =
                    keywords.filter(keyword =>
                        text.includes(
                            normalizeText(keyword)
                        )
                    );


                if (matches.length) {

                    scores.push({

                        category,

                        score:
                            matches.length,

                        matches
                    });
                }
            }
        );


    scores.sort(
        (a, b) =>
            b.score - a.score
    );


    if (!scores.length) {

        return {
            category: "unknown",
            confidence: 0,
            matches: []
        };
    }


    const best =
        scores[0];


    const confidence =
        Math.min(
            100,
            best.score * 15
        );


    return {

        category:
            best.category,

        confidence,

        matches:
            best.matches,

        alternatives:
            scores
                .slice(1, 4)
    };
}


function getContextDescription(
    category
) {

    const descriptions = {

        education:
            "The page appears to be related to education or students.",

        employment:
            "The page appears to be related to employment or careers.",

        registration:
            "The page appears to be a registration or account creation page.",

        shopping:
            "The page appears to be related to shopping or purchasing.",

        travel:
            "The page appears to be related to travel or booking.",

        event:
            "The page appears to be related to an event.",

        government:
            "The page appears to be a government or official service.",

        finance:
            "The page appears to be related to financial services.",

        unknown:
            "The page context could not be determined."
    };


    return (
        descriptions[category] ||
        descriptions.unknown
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.CONTEXT_PATTERNS =
        CONTEXT_PATTERNS;

    globalThis.analyzeContext =
        analyzeContext;

    globalThis.getContextDescription =
        getContextDescription;
}