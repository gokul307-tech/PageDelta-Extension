/*
 * PageDelta
 * Language Detector
 */

const LANGUAGE_WORDS = {

    en: [
        "the",
        "and",
        "or",
        "name",
        "email",
        "submit",
        "application",
        "deadline"
    ],

    fr: [
        "le",
        "la",
        "les",
        "et",
        "ou",
        "nom",
        "email",
        "date"
    ],

    es: [
        "el",
        "la",
        "los",
        "y",
        "o",
        "nombre",
        "correo",
        "fecha"
    ],

    de: [
        "der",
        "die",
        "das",
        "und",
        "oder",
        "name",
        "email",
        "datum"
    ],

    it: [
        "il",
        "la",
        "gli",
        "e",
        "o",
        "nome",
        "email",
        "data"
    ],

    pt: [
        "o",
        "a",
        "os",
        "e",
        "ou",
        "nome",
        "email",
        "data"
    ]
};


function detectLanguage(
    text = ""
) {

    if (!text) {

        return {

            language: "unknown",

            confidence: 0
        };
    }


    const words =
        normalizeText(text)
            .split(/\s+/)
            .filter(Boolean);


    const scores = {};


    Object.entries(
        LANGUAGE_WORDS
    )
        .forEach(
            ([language, keywords]) => {

                let score = 0;


                keywords.forEach(
                    keyword => {

                        score +=
                            words.filter(
                                word =>
                                    word ===
                                    keyword
                            ).length;
                    }
                );


                scores[language] =
                    score;
            }
        );


    const sorted =
        Object.entries(scores)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (
        !sorted.length ||
        sorted[0][1] === 0
    ) {

        return {

            language: "unknown",

            confidence: 0
        };
    }


    const best =
        sorted[0];


    const confidence =
        Math.min(
            100,
            Math.round(
                (best[1] /
                    Math.max(
                        words.length,
                        1
                    )) *
                1000
            )
        );


    return {

        language:
            best[0],

        confidence
    };
}


function getLanguageName(
    code
) {

    const names = {

        en: "English",

        fr: "French",

        es: "Spanish",

        de: "German",

        it: "Italian",

        pt: "Portuguese",

        unknown: "Unknown"
    };


    return (
        names[code] ||
        names.unknown
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.LANGUAGE_WORDS =
        LANGUAGE_WORDS;

    globalThis.detectLanguage =
        detectLanguage;

    globalThis.getLanguageName =
        getLanguageName;
}