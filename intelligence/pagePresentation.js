/*
 * PageDelta
 * Purpose-Aware Page Presentation
 */

(function () {

    "use strict";


    function clean(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replace(/\s+/g, " ")
            .trim();
    }


    function normalize(value) {

        return clean(value)
            .toLowerCase();
    }


    /*
     * --------------------------------------------------
     * Purpose keywords
     * --------------------------------------------------
     */

    const PURPOSE_RULES = [

        {
            purpose:
                "Find an assignment or submission deadline",

            keywords: [
                "assignment",
                "deadline",
                "due",
                "submission",
                "submit",
                "last date",
                "closing date"
            ]
        },

        {
            purpose:
                "Understand this topic",

            keywords: [
                "learn",
                "understand",
                "explain",
                "definition",
                "meaning",
                "history",
                "overview",
                "wikipedia",
                "article"
            ]
        },

        {
            purpose:
                "Check eligibility or requirements",

            keywords: [
                "eligibility",
                "eligible",
                "qualification",
                "requirements",
                "criteria",
                "required",
                "who can apply"
            ]
        },

        {
            purpose:
                "Complete an application or form",

            keywords: [
                "application",
                "apply",
                "registration",
                "register",
                "form",
                "applicant",
                "submit"
            ]
        },

        {
            purpose:
                "Buy or compare something",

            keywords: [
                "buy",
                "purchase",
                "price",
                "product",
                "cart",
                "checkout",
                "sale",
                "discount"
            ]
        },

        {
            purpose:
                "Find a job",

            keywords: [
                "job",
                "career",
                "vacancy",
                "hiring",
                "employment",
                "salary",
                "resume"
            ]
        },

        {
            purpose:
                "Find recent news or updates",

            keywords: [
                "news",
                "latest",
                "update",
                "breaking",
                "report",
                "published"
            ]
        }
    ];


    /*
     * --------------------------------------------------
     * Detect purpose
     * --------------------------------------------------
     */

    function detectPagePurpose(
        analysis
    ) {

        if (!analysis) {

            return {

                purpose:
                    "Understand this webpage",

                confidence:
                    10,

                alternatives: []
            };
        }


        const title =
            normalize(
                analysis.title
            );


        const headings =
            Array.isArray(
                analysis.headings
            )
                ? analysis.headings
                    .map(
                        heading =>
                            normalize(
                                typeof heading ===
                                "string"
                                    ? heading
                                    : (
                                        heading &&
                                        (
                                            heading.text ||
                                            heading.title ||
                                            ""
                                        )
                                    )
                            )
                    )
                    .join(" ")
                : "";


        const text =
            normalize(
                analysis.pageText
            )
                .slice(
                    0,
                    25000
                );


        const source =
            `${title} ${headings} ${text}`;


        const results = [];


        PURPOSE_RULES.forEach(
            rule => {

                let score =
                    0;

                const matches =
                    [];


                rule.keywords.forEach(
                    keyword => {

                        const normalizedKeyword =
                            normalize(
                                keyword
                            );


                        if (
                            title.includes(
                                normalizedKeyword
                            )
                        ) {

                            score +=
                                8;

                            matches.push(
                                keyword
                            );
                        }


                        if (
                            headings.includes(
                                normalizedKeyword
                            )
                        ) {

                            score +=
                                6;

                            matches.push(
                                keyword
                            );
                        }


                        if (
                            text.includes(
                                normalizedKeyword
                            )
                        ) {

                            score +=
                                2;

                            matches.push(
                                keyword
                            );
                        }

                    }
                );


                if (score > 0) {

                    results.push({

                        purpose:
                            rule.purpose,

                        score,

                        matches:
                            [
                                ...new Set(
                                    matches
                                )
                            ]
                    });
                }

            }
        );


        results.sort(
            (a, b) =>
                b.score -
                a.score
        );


        if (!results.length) {

            return {

                purpose:
                    "Understand this webpage",

                confidence:
                    20,

                alternatives: []
            };
        }


        const best =
            results[0];


        return {

            purpose:
                best.purpose,

            confidence:
                Math.min(
                    95,
                    30 +
                    best.score * 2
                ),

            matchedKeywords:
                best.matches,

            alternatives:
                results
                    .slice(1, 4)
                    .map(
                        result =>
                            result.purpose
                    )
        };
    }


    /*
     * --------------------------------------------------
     * User purpose scoring
     * --------------------------------------------------
     */

    const USER_PURPOSE_GROUPS = {

        deadline: [
            "deadline",
            "assignment",
            "submission",
            "due",
            "last date",
            "closing date",
            "exam date"
        ],

        learning: [
            "learn",
            "understand",
            "explain",
            "definition",
            "meaning",
            "history",
            "overview",
            "topic"
        ],

        eligibility: [
            "eligibility",
            "eligible",
            "qualification",
            "requirement",
            "criteria",
            "who can apply"
        ],

        form: [
            "form",
            "application",
            "apply",
            "registration",
            "register",
            "submit"
        ],

        shopping: [
            "buy",
            "price",
            "purchase",
            "product",
            "sale",
            "discount",
            "cart"
        ],

        job: [
            "job",
            "career",
            "vacancy",
            "hiring",
            "salary",
            "resume"
        ],

        news: [
            "news",
            "latest",
            "update",
            "breaking",
            "report"
        ]
    };


    function detectUserPurposeType(
        purpose
    ) {

        const source =
            normalize(
                purpose
            );


        let bestType =
            "general";

        let bestScore =
            0;


        Object.entries(
            USER_PURPOSE_GROUPS
        ).forEach(
            ([type, keywords]) => {

                let score =
                    0;


                keywords.forEach(
                    keyword => {

                        if (
                            source.includes(
                                normalize(
                                    keyword
                                )
                            )
                        ) {

                            score +=
                                keyword.length >= 7
                                    ? 3
                                    : 1;
                        }
                    }
                );


                if (
                    score >
                    bestScore
                ) {

                    bestScore =
                        score;

                    bestType =
                        type;
                }

            }
        );


        return bestType;
    }


    /*
     * --------------------------------------------------
     * Information scoring
     * --------------------------------------------------
     */

    function scoreInformation(
        item,
        purpose
    ) {

        const type =
            detectUserPurposeType(
                purpose
            );


        const text =
            normalize(
                [
                    item.title,
                    item.text,
                    item.description,
                    item.type
                ]
                    .filter(Boolean)
                    .join(" ")
            );


        let score =
            0;


        /*
         * Purpose-specific priorities.
         */

        if (
            type ===
            "deadline"
        ) {

            if (
                item.type ===
                "deadline"
            ) {
                score += 100;
            }


            if (
                text.includes(
                    "assignment"
                )
            ) {
                score += 60;
            }


            if (
                text.includes(
                    "submission"
                )
            ) {
                score += 50;
            }


            if (
                item.type ===
                "action"
            ) {
                score += 25;
            }

        }


        if (
            type ===
            "eligibility"
        ) {

            if (
                item.type ===
                "requirement"
            ) {
                score += 100;
            }


            if (
                text.includes(
                    "eligible"
                )
            ) {
                score += 50;
            }


            if (
                text.includes(
                    "qualification"
                )
            ) {
                score += 45;
            }

        }


        if (
            type ===
            "form"
        ) {

            if (
                item.type ===
                "field"
            ) {
                score += 100;
            }


            if (
                item.type ===
                "action"
            ) {
                score += 45;
            }

        }


        if (
            type ===
            "shopping"
        ) {

            if (
                item.type ===
                "price"
            ) {
                score += 100;
            }


            if (
                text.includes(
                    "discount"
                )
            ) {
                score += 50;
            }

        }


        if (
            type ===
            "job"
        ) {

            if (
                item.type ===
                "requirement"
            ) {
                score += 55;
            }


            if (
                item.type ===
                "action"
            ) {
                score += 40;
            }

        }


        if (
            type ===
            "news"
        ) {

            if (
                text.includes(
                    "latest"
                ) ||
                text.includes(
                    "update"
                )
            ) {
                score += 50;
            }

        }


        /*
         * Generic importance.
         */

        score +=
            Number(
                item.priority
            ) || 0;


        return score;
    }


    /*
     * --------------------------------------------------
     * Requirements
     * --------------------------------------------------
     */

    function getRequirementText(
        requirement
    ) {

        if (
            typeof requirement ===
            "string"
        ) {

            return clean(
                requirement
            );
        }


        if (!requirement) {
            return "";
        }


        return clean(

            requirement.context ||

            requirement.text ||

            requirement.description ||

            requirement.requirement ||

            requirement.value ||

            requirement.message ||

            ""
        );
    }


    function getRequirements(
        analysis
    ) {

        if (
            !Array.isArray(
                analysis.requirements
            )
        ) {
            return [];
        }


        const result =
            [];


        const seen =
            new Set();


        analysis.requirements.forEach(
            requirement => {

                const text =
                    getRequirementText(
                        requirement
                    );


                if (!text) {
                    return;
                }


                const key =
                    normalize(
                        text
                    );


                if (
                    seen.has(key)
                ) {
                    return;
                }


                seen.add(key);


                result.push({

                    type:
                        "requirement",

                    icon:
                        "📋",

                    title:
                        "Requirement",

                    text,

                    priority:
                        80
                });

            }
        );


        return result;
    }


    /*
     * --------------------------------------------------
     * Fields
     * --------------------------------------------------
     */

    function getFields(
        analysis
    ) {

        if (
            !Array.isArray(
                analysis.fields
            )
        ) {
            return [];
        }


        let fields =
            analysis.fields;


        if (
            typeof getUniqueClassifiedFields ===
            "function"
        ) {

            fields =
                getUniqueClassifiedFields(
                    fields
                );

        } else if (
            typeof classifyFields ===
            "function"
        ) {

            fields =
                classifyFields(
                    fields
                );
        }


        const matchesById =
            Array.isArray(
                analysis.fieldMatches
            )
                ? new Map(
                    analysis.fieldMatches.map(
                        match => [
                            match.id,
                            match
                        ]
                    )
                )
                : new Map();


        return fields
            .filter(
                field =>
                    !field.disabled
            )
            .map(
                field => {

                    const matchId =
                        field.id ||
                        field.selector ||
                        field.name ||
                        field.label ||
                        field.placeholder ||
                        "";

                    const match =
                        matchesById.get(
                            matchId
                        ) ||
                        null;

                    const title =
                        (match && match.label) ||
                        field.fieldLabel ||
                        field.label ||
                        (
                            typeof FIELD_LABELS !==
                            "undefined" &&
                            FIELD_LABELS[field.fieldType]
                        ) ||
                        "Information";

                    const status =
                        match && match.status
                            ? match.status
                            : 
                                field.required
                                    ? "missing"
                                    : "available";

                    return {

                        type:
                            "field",

                        icon:
                            "📝",

                        title,

                        text:
                            field.required
                                ? "Required field"
                                : "Information requested",

                        fieldType:
                            field.fieldType ||
                            "unknown",

                        confidence:
                            field.confidence ||
                            0,

                        required:
                            field.required === true,

                        status,

                        selector:
                            field.selector,

                        priority:
                            field.required
                                ? 90
                                : 70

                    };
                }
            );
    }


    /*
     * --------------------------------------------------
     * Deadlines
     * --------------------------------------------------
     */

    function getDeadlines(
        analysis
    ) {

        if (
            !Array.isArray(
                analysis.deadlines
            )
        ) {
            return [];
        }


        return analysis.deadlines
            .map(
                deadline => {

                    if (
                        typeof deadline ===
                        "string"
                    ) {

                        return {

                            type:
                                "deadline",

                            icon:
                                "📅",

                            title:
                                "Important date",

                            text:
                                clean(
                                    deadline
                                ),

                            priority:
                                100
                        };
                    }


                    if (!deadline) {
                        return null;
                    }


                    return {

                        type:
                            "deadline",

                        icon:
                            "📅",

                        title:
                            clean(
                                deadline.title ||
                                deadline.name ||
                                deadline.label ||
                                "Important date"
                            ),

                        text:
                            clean(
                                deadline.text ||
                                deadline.description ||
                                deadline.context ||
                                deadline.date ||
                                deadline.value ||
                                ""
                            ),

                        priority:
                            100
                    };

                }
            )
            .filter(
                Boolean
            );
    }


    /*
     * --------------------------------------------------
     * Actions
     * --------------------------------------------------
     */

    function normalizeActionLabel(
        value
    ) {

        const text =
            clean(
                value || ""
            ).toLowerCase();

        if (!text) {
            return "";
        }

        if (
            text.includes("submit") ||
            text.includes("submission")
        ) {
            return "Submit form";
        }

        if (
            text.includes("register") ||
            text.includes("registration")
        ) {
            return "Register";
        }

        if (
            text.includes("download")
        ) {
            return "Download";
        }

        if (
            text.includes("upload")
        ) {
            return "Upload file";
        }

        if (
            text.includes("book") ||
            text.includes("booking")
        ) {
            return "Book / Make a booking";
        }

        if (
            text.includes("apply") ||
            text.includes("application")
        ) {
            return "Apply";
        }

        if (
            text.includes("login") ||
            text.includes("sign in")
        ) {
            return "Sign in";
        }

        if (
            text.includes("contact") ||
            text.includes("call")
        ) {
            return "Contact";
        }

        return text
            .split(/\s+/)
            .filter(Boolean)
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    }


    function getActions(
        analysis
    ) {

        if (
            !Array.isArray(
                analysis.actions
            )
        ) {
            return [];
        }

        const seen = new Set();

        return analysis.actions
            .map(
                action => {

                    if (!action) {
                        return null;
                    }

                    const rawText =
                        clean(
                            action.label ||
                            action.text ||
                            action.description ||
                            action.keyword ||
                            action.type ||
                            ""
                        );

                    const label =
                        normalizeActionLabel(
                            rawText
                        );

                    if (!label) {
                        return null;
                    }

                    const key =
                        label.toLowerCase();

                    if (seen.has(key)) {
                        return null;
                    }

                    seen.add(key);

                    return {

                        type:
                            "action",

                        icon:
                            "⚡",

                        title:
                            label,

                        text:
                            label,

                        priority:
                            50
                    };

                }
            )
            .filter(
                Boolean
            );
    }


    /*
     * --------------------------------------------------
     * Prices
     * --------------------------------------------------
     */

    function getPrices(
        analysis
    ) {

        if (
            !Array.isArray(
                analysis.prices
            )
        ) {
            return [];
        }


        return analysis.prices
            .map(
                price => {

                    const text =
                        clean(
                            typeof price ===
                            "string"
                                ? price
                                : (
                                    price &&
                                    (
                                        price.text ||
                                        price.price ||
                                        price.value ||
                                        price.amount ||
                                        ""
                                    )
                                )
                        );


                    if (!text) {
                        return null;
                    }


                    return {

                        type:
                            "price",

                        icon:
                            "💰",

                        title:
                            "Price",

                        text,

                        priority:
                            40
                    };
                }
            )
            .filter(
                Boolean
            );
    }


    /*
     * --------------------------------------------------
     * Build presentation
     * --------------------------------------------------
     */

    function createPagePresentation(
        analysis,
        userPurpose = ""
    ) {

        if (!analysis) {
            return null;
        }


        const detectedPurpose =
            detectPagePurpose(
                analysis
            );


        const activePurpose =
            clean(
                userPurpose
            ) ||
            detectedPurpose.purpose;


        const purposeType =
            detectUserPurposeType(
                activePurpose
            );


        const allInformation = [

            ...getFields(
                analysis
            ),

            ...getDeadlines(
                analysis
            ),

            ...getRequirements(
                analysis
            ),

            ...getActions(
                analysis
            ),

            ...getPrices(
                analysis
            )

        ];


        /*
         * Purpose-aware sorting.
         */

        allInformation.forEach(
            item => {

                item.relevanceScore =
                    scoreInformation(
                        item,
                        activePurpose
                    );
            }
        );


        allInformation.sort(
            (a, b) =>
                b.relevanceScore -
                a.relevanceScore
        );


        /*
         * Keep the number manageable.
         */

        const importantInformation =
            allInformation.slice(
                0,
                10
            );


        return {

            version:
                "1.1.0",

            title:
                clean(
                    analysis.title
                ) ||
                "Current webpage",

            url:
                analysis.url ||
                window.location.href,

            summary: {

                text:
                    createSummary(
                        analysis
                    )
            },

            detectedPurpose,

            purpose: {

                purpose:
                    activePurpose,

                type:
                    purposeType,

                confidence:
                    userPurpose
                        ? 100
                        : detectedPurpose.confidence,

                userProvided:
                    Boolean(
                        userPurpose
                    ),

                alternatives:
                    detectedPurpose.alternatives ||
                    []
            },

            importantInformation,

            fields:
                getFields(
                    analysis
                ),

            fieldMatches:
                Array.isArray(
                    analysis.fieldMatches
                )
                    ? analysis.fieldMatches
                    : [],

            counts: {

                fields:
                    getFields(
                        analysis
                    ).length,

                deadlines:
                    getDeadlines(
                        analysis
                    ).length,

                requirements:
                    getRequirements(
                        analysis
                    ).length,

                actions:
                    getActions(
                        analysis
                    ).length,

                prices:
                    getPrices(
                        analysis
                    ).length
            },

            importance: {

                score:
                    Number(
                        analysis.importance
                    ) || 0,

                level:
                    analysis.importanceLevel ||
                    "low"
            }
        };
    }


    function createSummary(
        analysis
    ) {

        const title =
            clean(
                analysis.title
            );


        if (title) {

            return `This page contains information about ${title}.`;
        }


        return (
            "PageDelta found information on this webpage."
        );
    }


    /*
     * --------------------------------------------------
     * Re-analysis using user purpose
     * --------------------------------------------------
     */

    function createPurposeAwarePresentation(
        analysis,
        userPurpose
    ) {

        return createPagePresentation(
            analysis,
            userPurpose
        );
    }


    globalThis.detectPagePurpose =
        detectPagePurpose;


    globalThis.createPagePresentation =
        createPagePresentation;


    globalThis.createPurposeAwarePresentation =
        createPurposeAwarePresentation;


    globalThis.detectUserPurposeType =
        detectUserPurposeType;


    console.log(
        "[PageDelta] Purpose-aware presentation loaded."
    );

})();