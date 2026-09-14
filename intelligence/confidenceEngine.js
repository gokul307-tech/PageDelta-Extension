/*
 * PageDelta
 * Confidence Engine
 */

function calculateFieldConfidence(
    field
) {

    if (!field) {
        return 0;
    }


    let score = 0;


    if (field.fieldType !== "unknown") {
        score += 40;
    }


    if (field.label) {
        score += 20;
    }


    if (field.name) {
        score += 15;
    }


    if (field.placeholder) {
        score += 10;
    }


    if (field.ariaLabel) {
        score += 10;
    }


    if (
        field.type &&
        field.type !== "text"
    ) {
        score += 5;
    }


    return Math.min(
        100,
        score
    );
}


function calculateDetectionConfidence(
    item
) {

    if (!item) {
        return 0;
    }


    let score = 0;


    if (item.keyword) {
        score += 30;
    }


    if (item.context) {
        score += 30;
    }


    if (
        item.parsedDate ||
        item.amount !== undefined
    ) {
        score += 30;
    }


    if (item.matches) {
        score += Math.min(
            10,
            item.matches.length * 3
        );
    }


    return Math.min(
        100,
        score
    );
}


function confidenceLabel(
    confidence
) {

    if (confidence >= 85) {
        return "very-high";
    }

    if (confidence >= 70) {
        return "high";
    }

    if (confidence >= 50) {
        return "medium";
    }

    if (confidence >= 30) {
        return "low";
    }

    return "very-low";
}


function applyConfidence(
    analysis
) {

    if (!analysis) {
        return null;
    }


    if (
        Array.isArray(
            analysis.fields
        )
    ) {

        analysis.fields =
            analysis.fields.map(
                field => {

                    const confidence =
                        Math.max(
                            Number(
                                field.confidence ||
                                0
                            ),
                            calculateFieldConfidence(
                                field
                            )
                        );


                    return {

                        ...field,

                        confidence,

                        confidenceLabel:
                            confidenceLabel(
                                confidence
                            )
                    };
                }
            );
    }


    return analysis;
}


if (typeof globalThis !== "undefined") {

    globalThis.calculateFieldConfidence =
        calculateFieldConfidence;

    globalThis.calculateDetectionConfidence =
        calculateDetectionConfidence;

    globalThis.confidenceLabel =
        confidenceLabel;

    globalThis.applyConfidence =
        applyConfidence;
}