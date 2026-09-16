/*
 * PageDelta
 * Page Presentation & Page Understanding Layer
 *
 * Converts raw analyzer output into human-friendly
 * information for the PageDelta user interface.
 *
 * IMPORTANT:
 * This layer does NOT replace the analyzer.
 * It interprets and presents its results.
 */

(function () {

    "use strict";


    /*
     * --------------------------------------------------
     * Utility helpers
     * --------------------------------------------------
     */

    function clean(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        if (
            typeof globalThis.cleanText ===
            "function"
        ) {

            try {

                return globalThis.cleanText(
                    value
                );

            } catch (error) {
                // Fall through.
            }
        }


        return String(value)
            .replace(/\s+/g, " ")
            .trim();
    }


    function normalize(value) {

        return clean(value)
            .toLowerCase();
    }


    function uniqueStrings(
        values
    ) {

        const result = [];

        const seen =
            new Set();


        if (
            !Array.isArray(values)
        ) {
            return result;
        }


        values.forEach(
            value => {

                const text =
                    clean(value);


                if (!text) {
                    return;
                }


                const key =
                    normalize(text);


                if (
                    seen.has(key)
                ) {
                    return;
                }


                seen.add(key);

                result.push(text);
            }
        );


        return result;
    }


    /*
     * --------------------------------------------------
     * Page type detection
     * --------------------------------------------------
     */

    const PAGE_TYPE_RULES = [

        {
            type: "Course / Learning",
            keywords: [
                "course",
                "lecture",
                "assignment",
                "quiz",
                "exam",
                "nptel",
                "learn",
                "lesson",
                "module",
                "certificate",
                "enroll"
            ]
        },

        {
            type: "Shopping / Product",
            keywords: [
                "buy",
                "cart",
                "checkout",
                "price",
                "product",
                "add to cart",
                "sale",
                "discount",
                "₹",
                "$",
                "in stock"
            ]
        },

        {
            type: "Application / Form",
            keywords: [
                "application form",
                "apply now",
                "registration form",
                "register",
                "application",
                "applicant",
                "submit"
            ]
        },

        {
            type: "Job / Career",
            keywords: [
                "job",
                "career",
                "vacancy",
                "hiring",
                "employment",
                "resume",
                "cv",
                "salary",
                "job description"
            ]
        },

        {
            type: "News / Article",
            keywords: [
                "news",
                "breaking",
                "report",
                "article",
                "published",
                "journalist",
                "latest"
            ]
        },

        {
            type: "Government / Public Information",
            keywords: [
                "government",
                "ministry",
                "citizen",
                "election",
                "voter",
                "official",
                "scheme",
                "department",
                "portal"
            ]
        },

        {
            type: "Reference / Information",
            keywords: [
                "wikipedia",
                "encyclopedia",
                "definition",
                "history",
                "overview",
                "information",
                "reference",
                "meaning"
            ]
        }
    ];


    function detectPageType(
        analysis
    ) {

        if (!analysis) {

            return {
                type: "Webpage",
                confidence: 0
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
                        item =>
                            normalize(
                                item &&
                                item.text
                            )
                    )
                    .join(" ")
                : "";


        const text =
            normalize(
                analysis.pageText
            )
                .substring(
                    0,
                    15000
                );


        const source =
            `${title} ${headings} ${text}`;


        const scores = [];


        PAGE_TYPE_RULES.forEach(
            rule => {

                let score = 0;

                const matches = [];


                rule.keywords.forEach(
                    keyword => {

                        if (
                            source.includes(
                                normalize(
                                    keyword
                                )
                            )
                        ) {

                            score +=
                                keyword.length >= 8
                                    ? 3
                                    : 1;

                            matches.push(
                                keyword
                            );
                        }
                    }
                );


                if (score > 0) {

                    scores.push({

                        type:
                            rule.type,

                        score,

                        matches
                    });
                }

            }
        );


        if (!scores.length) {

            return {
                type: "Webpage",
                confidence: 20
            };
        }


        scores.sort(
            (a, b) =>
                b.score - a.score
        );


        const best =
            scores[0];


        const confidence =
            Math.min(
                95,
                30 +
                best.score * 8
            );


        return {

            type:
                best.type,

            confidence,

            matchedKeywords:
                best.matches
        };
    }


    /*
     * --------------------------------------------------
     * Purpose detection
     * --------------------------------------------------
     */

    const PURPOSE_RULES = [

        {
            purpose:
                "Check a deadline or important date",

            keywords: [
                "deadline",
                "due date",
                "last date",
                "submission date",
                "exam date",
                "closing date",
                "schedule"
            ]
        },

        {
            purpose:
                "Complete or submit something",

            keywords: [
                "submit",
                "application",
                "apply",
                "registration",
                "register",
                "form",
                "upload"
            ]
        },

        {
            purpose:
                "Learn or understand the topic",

            keywords: [
                "course",
                "lesson",
                "lecture",
                "tutorial",
                "learn",
                "definition",
                "overview",
                "explanation",
                "wikipedia"
            ]
        },

        {
            purpose:
                "Check eligibility or requirements",

            keywords: [
                "eligibility",
                "eligible",
                "requirements",
                "qualification",
                "criteria",
                "must be",
                "required"
            ]
        },

        {
            purpose:
                "Buy or compare a product",

            keywords: [
                "price",
                "buy",
                "purchase",
                "cart",
                "checkout",
                "discount",
                "sale",
                "product"
            ]
        },

        {
            purpose:
                "Find information or news",

            keywords: [
                "news",
                "latest",
                "information",
                "article",
                "report",
                "update"
            ]
        },

        {
            purpose:
                "Find a job or career opportunity",

            keywords: [
                "job",
                "career",
                "vacancy",
                "hiring",
                "salary",
                "resume",
                "apply"
            ]
        }
    ];


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


        const headingText =
            Array.isArray(
                analysis.headings
            )
                ? analysis.headings
                    .map(
                        item =>
                            normalize(
                                item &&
                                item.text
                            )
                    )
                    .join(" ")
                : "";


        const keywordText =
            Array.isArray(
                analysis.keywords
            )
                ? analysis.keywords
                    .map(
                        item => {

                            if (
                                typeof item ===
                                "string"
                            ) {
                                return normalize(
                                    item
                                );
                            }


                            return normalize(
                                item &&
                                (
                                    item.keyword ||
                                    item.text ||
                                    item.value ||
                                    ""
                                )
                            );
                        }
                    )
                    .join(" ")
                : "";


        const pageText =
            normalize(
                analysis.pageText
            )
                .substring(
                    0,
                    20000
                );


        /*
         * Title and headings receive higher weight
         * because they usually describe the actual
         * page better than repeated body text.
         */

        const weightedSources = [

            {
                text: title,
                weight: 5
            },

            {
                text: headingText,
                weight: 4
            },

            {
                text: keywordText,
                weight: 2
            },

            {
                text: pageText,
                weight: 1
            }
        ];


        const scores = [];


        PURPOSE_RULES.forEach(
            rule => {

                let score = 0;

                const matched = [];


                rule.keywords.forEach(
                    keyword => {

                        const normalizedKeyword =
                            normalize(
                                keyword
                            );


                        weightedSources.forEach(
                            source => {

                                if (
                                    source.text.includes(
                                        normalizedKeyword
                                    )
                                ) {

                                    score +=
                                        source.weight;

                                    matched.push(
                                        keyword
                                    );
                                }

                            }
                        );

                    }
                );


                if (score > 0) {

                    scores.push({

                        purpose:
                            rule.purpose,

                        score,

                        matchedKeywords:
                            uniqueStrings(
                                matched
                            )
                    });
                }

            }
        );


        if (!scores.length) {

            return {

                purpose:
                    "Understand this webpage",

                confidence:
                    25,

                alternatives: []
            };
        }


        scores.sort(
            (a, b) =>
                b.score - a.score
        );


        const best =
            scores[0];


        const confidence =
            Math.min(
                95,
                35 +
                best.score * 3
            );


        return {

            purpose:
                best.purpose,

            confidence,

            matchedKeywords:
                best.matchedKeywords,

            alternatives:
                scores
                    .slice(1, 4)
                    .map(
                        item =>
                            item.purpose
                    )
        };
    }


    /*
     * --------------------------------------------------
     * Human-friendly requirement formatting
     * --------------------------------------------------
     */

    function extractRequirementText(
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


        /*
         * Prefer context because the current
         * analyzer often places the useful
         * human-readable requirement there.
         */

        const candidates = [

            requirement.text,

            requirement.description,

            requirement.context,

            requirement.value,

            requirement.message,

            requirement.requirement
        ];


        for (
            const candidate of candidates
        ) {

            const text =
                clean(candidate);


            if (text) {

                return text;
            }
        }


        return "";
    }


    function simplifyRequirement(
        requirement
    ) {

        const text =
            extractRequirementText(
                requirement
            );


        if (!text) {
            return null;
        }


        /*
         * Remove repeated whitespace.
         */

        let result =
            text.replace(
                /\s+/g,
                " "
            ).trim();


        /*
         * Remove accidental leading
         * punctuation.
         */

        result =
            result.replace(
                /^[\s:;-]+/,
                ""
            );


        /*
         * Avoid extremely long cards.
         */

        if (
            result.length > 500
        ) {

            result =
                result.substring(
                    0,
                    497
                ) +
                "...";
        }


        return result;
    }


    function deduplicateRequirements(
        requirements
    ) {

        if (
            !Array.isArray(
                requirements
            )
        ) {
            return [];
        }


        const results = [];

        const seen = [];


        requirements.forEach(
            requirement => {

                const text =
                    simplifyRequirement(
                        requirement
                    );


                if (!text) {
                    return;
                }


                const normalized =
                    normalize(text);


                /*
                 * Exact duplicate.
                 */

                if (
                    seen.includes(
                        normalized
                    )
                ) {
                    return;
                }


                /*
                 * Detect near-duplicates.
                 *
                 * If one requirement contains the
                 * other, keep the longer one.
                 */

                const duplicateIndex =
                    seen.findIndex(
                        existing =>
                            existing.includes(
                                normalized
                            ) ||
                            normalized.includes(
                                existing
                            )
                    );


                if (
                    duplicateIndex !== -1
                ) {

                    if (
                        normalized.length >
                        seen[
                            duplicateIndex
                        ].length
                    ) {

                        results[
                            duplicateIndex
                        ] = text;

                        seen[
                            duplicateIndex
                        ] = normalized;
                    }


                    return;
                }


                seen.push(
                    normalized
                );


                results.push(
                    text
                );
            }
        );


        return results;
    }


    /*
     * --------------------------------------------------
     * Deadline formatting
     * --------------------------------------------------
     */

    function formatDeadline(
        deadline
    ) {

        if (
            typeof deadline ===
            "string"
        ) {

            return {

                title:
                    "Important date",

                text:
                    clean(deadline)
            };
        }


        if (!deadline) {
            return null;
        }


        const title =
            clean(
                deadline.title ||
                deadline.name ||
                deadline.label ||
                "Important date"
            );


        const text =
            clean(
                deadline.text ||
                deadline.description ||
                deadline.context ||
                deadline.value ||
                deadline.date ||
                ""
            );


        if (
            !title &&
            !text
        ) {
            return null;
        }


        return {

            title:
                title ||
                "Important date",

            text:
                text ||
                title
        };
    }


    /*
     * --------------------------------------------------
     * Priority information
     * --------------------------------------------------
     */

    function buildImportantInformation(
        analysis
    ) {

        const items = [];


        /*
         * Deadlines are important.
         */

        if (
            Array.isArray(
                analysis.deadlines
            )
        ) {

            analysis.deadlines
                .slice(0, 5)
                .forEach(
                    deadline => {

                        const item =
                            formatDeadline(
                                deadline
                            );


                        if (item) {

                            items.push({

                                type:
                                    "deadline",

                                icon:
                                    "📅",

                                title:
                                    item.title,

                                text:
                                    item.text,

                                priority:
                                    100
                            });
                        }

                    }
                );
        }


        /*
         * Requirements.
         */

        const requirements =
            deduplicateRequirements(
                analysis.requirements
            );


        requirements
            .slice(0, 5)
            .forEach(
                text => {

                    items.push({

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


        /*
         * Actions.
         */

        if (
            Array.isArray(
                analysis.actions
            )
        ) {

            const seen =
                new Set();


            analysis.actions
                .forEach(
                    action => {

                        if (!action) {
                            return;
                        }


                        const label =
                            clean(
                                action.label ||
                                action.text ||
                                action.keyword ||
                                action.type ||
                                ""
                            );


                        if (!label) {
                            return;
                        }


                        const key =
                            normalize(
                                label
                            );


                        if (
                            seen.has(key)
                        ) {
                            return;
                        }


                        seen.add(key);


                        items.push({

                            type:
                                "action",

                            icon:
                                "⚡",

                            title:
                                "Action available",

                            text:
                                label,

                            priority:
                                action.requiresConfirmation
                                    ? 70
                                    : 50
                        });
                    }
                );
        }


        /*
         * Prices.
         */

        if (
            Array.isArray(
                analysis.prices
            )
        ) {

            analysis.prices
                .slice(0, 3)
                .forEach(
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
                                            price.value ||
                                            price.price ||
                                            ""
                                        )
                                    )
                            );


                        if (!text) {
                            return;
                        }


                        items.push({

                            type:
                                "price",

                            icon:
                                "💰",

                            title:
                                "Price",

                            text,

                            priority:
                                40
                        });

                    }
                );
        }


        items.sort(
            (a, b) =>
                b.priority -
                a.priority
        );


        return items.slice(
            0,
            8
        );
    }


    /*
     * --------------------------------------------------
     * Page summary
     * --------------------------------------------------
     */

    function createPageSummary(
        analysis
    ) {

        if (!analysis) {

            return {
                text:
                    "Page information is not available."
            };
        }


        const type =
            detectPageType(
                analysis
            );


        const title =
            clean(
                analysis.title
            );


        if (
            title &&
            type.type !== "Webpage"
        ) {

            return {

                text:
                    `${type.type} page: ${title}.`,

                type:
                    type.type
            };
        }


        if (title) {

            return {

                text:
                    `Information about ${title}.`,

                type:
                    type.type
            };
        }


        return {

            text:
                "Information from the current webpage.",

            type:
                type.type
        };
    }


    /*
     * --------------------------------------------------
     * Complete presentation object
     * --------------------------------------------------
     */

    function createPagePresentation(
        analysis
    ) {

        if (!analysis) {
            return null;
        }


        const pageType =
            detectPageType(
                analysis
            );


        const purpose =
            detectPagePurpose(
                analysis
            );


        const summary =
            createPageSummary(
                analysis
            );


        const importantInformation =
            buildImportantInformation(
                analysis
            );


        const fieldCount =
            Array.isArray(
                analysis.fields
            )
                ? analysis.fields.length
                : 0;


        const actionCount =
            Array.isArray(
                analysis.actions
            )
                ? analysis.actions.length
                : 0;


        const deadlineCount =
            Array.isArray(
                analysis.deadlines
            )
                ? analysis.deadlines.length
                : 0;


        const requirementCount =
            deduplicateRequirements(
                analysis.requirements
            ).length;


        return {

            version:
                "1.0.0",

            title:
                clean(
                    analysis.title
                ) ||
                "Current webpage",

            url:
                analysis.url ||
                window.location.href,

            pageType,

            summary,

            purpose,

            importantInformation,

            counts: {

                fields:
                    fieldCount,

                actions:
                    actionCount,

                deadlines:
                    deadlineCount,

                requirements:
                    requirementCount,

                prices:
                    Array.isArray(
                        analysis.prices
                    )
                        ? analysis.prices.length
                        : 0
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


    /*
     * --------------------------------------------------
     * Export
     * --------------------------------------------------
     */

    globalThis.detectPageType =
        detectPageType;


    globalThis.detectPagePurpose =
        detectPagePurpose;


    globalThis.deduplicateRequirements =
        deduplicateRequirements;


    globalThis.buildImportantInformation =
        buildImportantInformation;


    globalThis.createPageSummary =
        createPageSummary;


    globalThis.createPagePresentation =
        createPagePresentation;


    console.log(
        "[PageDelta] Page presentation layer loaded."
    );

})();