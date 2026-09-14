/*
 * PageDelta
 * Text Extraction Engine
 */

function extractPageText() {

    if (!document.body) {
        return "";
    }

    const clonedBody =
        document.body.cloneNode(true);

    const elementsToRemove =
        clonedBody.querySelectorAll(
            "script, style, noscript, svg, canvas, iframe, video, audio, nav, footer"
        );

    elementsToRemove.forEach(
        element => element.remove()
    );

    const text =
        clonedBody.innerText ||
        clonedBody.textContent ||
        "";

    return cleanText(text).substring(
        0,
        PAGEDELTA.LIMITS.MAX_TEXT_LENGTH
    );
}


function extractVisibleTextElements() {

    if (!document.body) {
        return [];
    }

    const elements =
        document.body.querySelectorAll(
            "h1, h2, h3, h4, h5, h6, p, li, label, button, a, td, th, strong"
        );

    const results = [];

    elements.forEach(element => {

        if (!isElementVisible(element)) {
            return;
        }

        const text =
            cleanText(
                element.innerText ||
                element.textContent ||
                ""
            );

        if (
            !text ||
            text.length < 2
        ) {
            return;
        }

        results.push({

            tag:
                element.tagName.toLowerCase(),

            text:
                truncateText(
                    text,
                    PAGEDELTA.LIMITS
                        .MAX_ELEMENT_TEXT_LENGTH
                )
        });
    });

    return results.slice(
        0,
        PAGEDELTA.LIMITS
            .MAX_VISIBLE_ELEMENTS
    );
}


function extractHeadings() {

    const headings =
        document.querySelectorAll(
            "h1, h2, h3, h4, h5, h6"
        );

    return Array.from(headings)
        .map(element => ({

            level:
                Number(
                    element.tagName
                        .substring(1)
                ),

            text:
                cleanText(
                    element.innerText ||
                    element.textContent ||
                    ""
                )
        }))
        .filter(item => item.text)
        .slice(
            0,
            PAGEDELTA.LIMITS.MAX_HEADINGS
        );
}


function extractParagraphs() {

    const paragraphs =
        document.querySelectorAll("p");

    return Array.from(paragraphs)
        .map(element =>
            cleanText(
                element.innerText ||
                element.textContent ||
                ""
            )
        )
        .filter(text => text.length > 1)
        .slice(0, 500);
}


function extractLists() {

    const lists =
        document.querySelectorAll("li");

    return Array.from(lists)
        .map(element =>
            cleanText(
                element.innerText ||
                element.textContent ||
                ""
            )
        )
        .filter(text => text.length > 1)
        .slice(0, 500);
}


if (typeof globalThis !== "undefined") {

    globalThis.extractPageText =
        extractPageText;

    globalThis.extractVisibleTextElements =
        extractVisibleTextElements;

    globalThis.extractHeadings =
        extractHeadings;

    globalThis.extractParagraphs =
        extractParagraphs;

    globalThis.extractLists =
        extractLists;
}