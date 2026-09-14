/*
 * PageDelta
 * Text Difference Engine
 */

function compareText(
    oldText = "",
    newText = ""
) {

    const oldClean =
        normalizeDiffText(
            oldText
        );

    const newClean =
        normalizeDiffText(
            newText
        );

    if (oldClean === newClean) {

        return {
            changed: false,
            added: [],
            removed: [],
            similarity: 1,
            changePercentage: 0
        };
    }


    const oldWords =
        oldClean
            .split(/\s+/)
            .filter(Boolean);

    const newWords =
        newClean
            .split(/\s+/)
            .filter(Boolean);


    const oldSet =
        new Set(oldWords);

    const newSet =
        new Set(newWords);


    const added =
        newWords.filter(
            word =>
                !oldSet.has(word)
        );


    const removed =
        oldWords.filter(
            word =>
                !newSet.has(word)
        );


    const total =
        Math.max(
            oldSet.size,
            newSet.size,
            1
        );


    const difference =
        added.length +
        removed.length;


    const changePercentage =
        Math.min(
            100,
            Math.round(
                (difference / total) *
                100
            )
        );


    const similarity =
        Math.max(
            0,
            1 -
            (
                changePercentage /
                100
            )
        );


    return {

        changed: true,

        added:
            uniqueValues(
                added
            ),

        removed:
            uniqueValues(
                removed
            ),

        similarity,

        changePercentage
    };
}


function normalizeDiffText(
    text
) {

    return String(text || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


function uniqueValues(
    values
) {

    return [
        ...new Set(values)
    ];
}


function getTextChangeSummary(
    diff
) {

    if (!diff || !diff.changed) {
        return "No text changes detected.";
    }


    return [
        `Added: ${diff.added.length}`,
        `Removed: ${diff.removed.length}`,
        `Change: ${diff.changePercentage}%`
    ].join(" | ");
}


if (typeof globalThis !== "undefined") {

    globalThis.compareText =
        compareText;

    globalThis.getTextChangeSummary =
        getTextChangeSummary;
}