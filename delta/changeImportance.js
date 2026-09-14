/*
 * PageDelta
 * Change Importance Engine
 */

function calculateChangeImportance(
    changes
) {

    if (!changes) {
        return {
            score: 0,
            level: "low",
            reasons: []
        };
    }


    let score = 0;

    const reasons = [];


    /*
     * Deadline changes are extremely important.
     */
    if (
        changes.deadlines?.changed
    ) {

        score += 40;

        reasons.push(
            "Deadline information changed."
        );
    }


    /*
     * Requirements.
     */
    if (
        changes.requirements?.changed
    ) {

        score += 30;

        reasons.push(
            "Requirements changed."
        );
    }


    /*
     * Form changes.
     */
    if (
        changes.fields?.changed
    ) {

        score += 20;

        reasons.push(
            "Form fields changed."
        );
    }


    /*
     * Buttons/actions.
     */
    if (
        changes.buttons?.changed
    ) {

        score += 15;

        reasons.push(
            "Available actions changed."
        );
    }


    /*
     * Headings.
     */
    if (
        changes.headings?.changed
    ) {

        score += 10;

        reasons.push(
            "Page headings changed."
        );
    }


    /*
     * Text changes.
     */
    if (
        changes.text?.changed
    ) {

        const percentage =
            changes.text
                .changePercentage || 0;


        if (percentage >= 30) {

            score += 20;

            reasons.push(
                "Large amount of page text changed."
            );

        } else if (
            percentage >= 10
        ) {

            score += 10;

            reasons.push(
                "Page text changed."
            );
        }
    }


    /*
     * Price changes.
     */
    if (
        changes.prices?.changed
    ) {

        score += 25;

        reasons.push(
            "Price information changed."
        );
    }


    score =
        Math.min(
            100,
            score
        );


    return {

        score,

        level:
            getChangeImportanceLevel(
                score
            ),

        reasons
    };
}


function getChangeImportanceLevel(
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


function isImportantChange(
    changes
) {

    const result =
        calculateChangeImportance(
            changes
        );

    return (
        result.score >= 25
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.calculateChangeImportance =
        calculateChangeImportance;

    globalThis.getChangeImportanceLevel =
        getChangeImportanceLevel;

    globalThis.isImportantChange =
        isImportantChange;
}