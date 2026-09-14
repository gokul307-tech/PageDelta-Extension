/*
 * PageDelta
 * Importance Scoring
 */

function calculateImportance(
    analysis
) {

    if (!analysis) {
        return 0;
    }


    let score = 0;


    if (
        analysis.deadlines &&
        analysis.deadlines.length
    ) {
        score += 35;
    }


    if (
        analysis.requirements &&
        analysis.requirements.length
    ) {
        score += 20;
    }


    if (
        analysis.actions &&
        analysis.actions.length
    ) {
        score += 15;
    }


    if (
        analysis.prices &&
        analysis.prices.length
    ) {
        score += 10;
    }


    if (
        analysis.contacts &&
        (
            analysis.contacts.emails?.length ||
            analysis.contacts.phones?.length
        )
    ) {
        score += 5;
    }


    if (
        analysis.keywords &&
        Object.keys(
            analysis.keywords
        ).length
    ) {
        score += 10;
    }


    return Math.min(
        100,
        score
    );
}


function getImportanceLevel(
    score
) {

    if (score >= 75) {
        return "critical";
    }

    if (score >= 50) {
        return "high";
    }

    if (score >= 25) {
        return "medium";
    }

    return "low";
}


function scoreItem(
    item
) {

    if (!item) {
        return 0;
    }


    let score = 0;


    if (
        item.type === "deadline" ||
        item.category === "deadline"
    ) {
        score += 50;
    }


    if (
        item.type === "requirement" ||
        item.category === "eligibility"
    ) {
        score += 30;
    }


    if (
        item.type === "action"
    ) {
        score += 25;
    }


    return Math.min(
        100,
        score
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.calculateImportance =
        calculateImportance;

    globalThis.getImportanceLevel =
        getImportanceLevel;

    globalThis.scoreItem =
        scoreItem;
}