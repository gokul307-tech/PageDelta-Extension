/*
 * PageDelta
 * DOM utilities
 */

function isElementVisible(element) {

    if (!element) {
        return false;
    }

    if (!(element instanceof Element)) {
        return false;
    }

    const style =
        window.getComputedStyle(element);

    if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
    ) {
        return false;
    }

    const rect =
        element.getBoundingClientRect();

    return (
        rect.width > 0 &&
        rect.height > 0
    );
}


function getElementText(element) {

    if (!element) {
        return "";
    }

    return cleanText(
        element.innerText ||
        element.textContent ||
        ""
    );
}


function getAttribute(
    element,
    attribute
) {

    if (
        !element ||
        !attribute
    ) {
        return "";
    }

    return (
        element.getAttribute(
            attribute
        ) || ""
    ).trim();
}


function getElementAttributes(
    element
) {

    if (!element) {
        return {};
    }

    const attributes = {};

    for (
        const attribute of
        Array.from(element.attributes || [])
    ) {

        attributes[
            attribute.name
        ] = attribute.value;
    }

    return attributes;
}


function getElementSelector(element) {

    if (!element || !element.tagName) {
        return "";
    }

    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    const parts = [];

    let current = element;

    while (
        current &&
        current.nodeType === 1 &&
        current !== document.body
    ) {

        let selector =
            current.tagName.toLowerCase();

        if (current.classList.length) {

            const validClass =
                Array.from(
                    current.classList
                )
                    .find(
                        className =>
                            /^[a-zA-Z_][\w-]*$/
                                .test(className)
                    );

            if (validClass) {
                selector +=
                    `.${CSS.escape(validClass)}`;
            }
        }

        const parent =
            current.parentElement;

        if (parent) {

            const siblings =
                Array.from(
                    parent.children
                )
                    .filter(
                        child =>
                            child.tagName ===
                            current.tagName
                    );

            if (siblings.length > 1) {

                const index =
                    siblings.indexOf(current) + 1;

                selector +=
                    `:nth-of-type(${index})`;
            }
        }

        parts.unshift(selector);

        current =
            current.parentElement;
    }

    return parts.join(" > ");
}


function findInputs() {

    if (!document) {
        return [];
    }

    return Array.from(
        document.querySelectorAll(
            "input, textarea, select"
        )
    );
}


function findButtons() {

    return Array.from(
        document.querySelectorAll(
            "button, input[type='button'], input[type='submit'], input[type='reset']"
        )
    );
}


function findForms() {

    return Array.from(
        document.querySelectorAll("form")
    );
}


function findLinks() {

    return Array.from(
        document.querySelectorAll("a[href]")
    );
}


function getAssociatedLabel(
    element
) {

    if (!element) {
        return "";
    }


    const id =
        element.id;


    if (id) {

        const label =
            document.querySelector(
                `label[for="${CSS.escape(id)}"]`
            );

        if (label) {
            return getElementText(label);
        }
    }


    const parentLabel =
        element.closest("label");

    if (parentLabel) {
        return getElementText(
            parentLabel
        );
    }


    return "";
}


function getElementContext(
    element
) {

    if (!element) {
        return "";
    }


    const pieces = [];


    const label =
        getAssociatedLabel(element);

    if (label) {
        pieces.push(label);
    }


    const placeholder =
        getAttribute(
            element,
            "placeholder"
        );

    if (placeholder) {
        pieces.push(placeholder);
    }


    const ariaLabel =
        getAttribute(
            element,
            "aria-label"
        );

    if (ariaLabel) {
        pieces.push(ariaLabel);
    }


    const name =
        getAttribute(
            element,
            "name"
        );

    if (name) {
        pieces.push(name);
    }


    const surrounding =
        element.parentElement;

    if (surrounding) {

        const text =
            getElementText(
                surrounding
            );

        if (text) {
            pieces.push(
                truncateText(
                    text,
                    500
                )
            );
        }
    }


    return cleanText(
        pieces.join(" ")
    );
}


function isFormControl(
    element
) {

    if (!element) {
        return false;
    }

    const tag =
        element.tagName
            ?.toLowerCase();

    return [
        "input",
        "textarea",
        "select",
        "button"
    ].includes(tag);
}


if (typeof globalThis !== "undefined") {

    globalThis.isElementVisible =
        isElementVisible;

    globalThis.getElementText =
        getElementText;

    globalThis.getAttribute =
        getAttribute;

    globalThis.getElementAttributes =
        getElementAttributes;

    globalThis.getElementSelector =
        getElementSelector;

    globalThis.findInputs =
        findInputs;

    globalThis.findButtons =
        findButtons;

    globalThis.findForms =
        findForms;

    globalThis.findLinks =
        findLinks;

    globalThis.getAssociatedLabel =
        getAssociatedLabel;

    globalThis.getElementContext =
        getElementContext;

    globalThis.isFormControl =
        isFormControl;
}