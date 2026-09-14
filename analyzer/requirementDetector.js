/*
 * PageDelta
 * Requirement Detector
 */

const REQUIREMENT_KEYWORDS = {

    eligibility: [
        "eligible",
        "eligibility",
        "qualification",
        "qualifications",
        "criteria",
        "must be",
        "minimum requirement"
    ],

    documents: [
        "required documents",
        "documents required",
        "documents needed",
        "upload",
        "certificate",
        "proof",
        "identity proof",
        "address proof"
    ],

    education: [
        "degree",
        "qualification",
        "12th",
        "10th",
        "undergraduate",
        "graduate",
        "diploma",
        "bachelor",
        "master"
    ],

    experience: [
        "experience required",
        "years of experience",
        "work experience",
        "prior experience"
    ],

    technical: [
        "skills required",
        "technical skills",
        "programming",
        "knowledge of",
        "proficiency"
    ]
};


function detectRequirements(
    text = extractPageText()
) {

    if (!text) {
        return [];
    }


    const normalized =
        normalizeText(text);


    const results = [];


    Object.entries(
        REQUIREMENT_KEYWORDS
    )
        .forEach(
            ([category, keywords]) => {

                keywords.forEach(
                    keyword => {

                        if (
                            normalized.includes(
                                normalizeText(
                                    keyword
                                )
                            )
                        ) {

                            const context =
                                getKeywordContext(
                                    text,
                                    keyword
                                );


                            results.push({

                                category,

                                keyword,

                                context
                            });
                        }
                    }
                );
            }
        );


    return removeDuplicateRequirements(
        results
    );
}


function getKeywordContext(
    text,
    keyword,
    radius = 150
) {

    const lowerText =
        text.toLowerCase();

    const lowerKeyword =
        keyword.toLowerCase();

    const index =
        lowerText.indexOf(
            lowerKeyword
        );


    if (index === -1) {
        return "";
    }


    return cleanText(
        text.substring(
            Math.max(
                0,
                index - radius
            ),
            Math.min(
                text.length,
                index +
                keyword.length +
                radius
            )
        )
    );
}


function removeDuplicateRequirements(
    requirements
) {

    const seen = new Set();

    return requirements.filter(
        item => {

            const key =
                `${item.category}:${item.keyword}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);

            return true;
        }
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.detectRequirements =
        detectRequirements;
}