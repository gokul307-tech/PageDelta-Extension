/*
 * PageDelta
 * Price Detector
 */

const PRICE_PATTERN =
    /(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP)\s?\d[\d,]*(?:\.\d{1,2})?/gi;


function detectPrices(
    text = extractPageText()
) {

    if (!text) {
        return [];
    }


    const matches =
        text.match(
            PRICE_PATTERN
        ) || [];


    return matches
        .map(price => {

            const clean =
                cleanText(price);


            return {

                text: clean,

                currency:
                    detectCurrency(
                        clean
                    ),

                amount:
                    extractPriceAmount(
                        clean
                    )
            };
        })
        .filter(
            item =>
                item.amount !== null
        );
}


function detectCurrency(
    value
) {

    const text =
        String(value)
            .toUpperCase();


    if (
        text.includes("₹") ||
        text.includes("RS") ||
        text.includes("INR")
    ) {
        return "INR";
    }


    if (
        text.includes("$") ||
        text.includes("USD")
    ) {
        return "USD";
    }


    if (
        text.includes("€") ||
        text.includes("EUR")
    ) {
        return "EUR";
    }


    if (
        text.includes("£") ||
        text.includes("GBP")
    ) {
        return "GBP";
    }


    return "UNKNOWN";
}


function extractPriceAmount(
    value
) {

    const match =
        String(value)
            .replace(/,/g, "")
            .match(
                /\d+(?:\.\d{1,2})?/
            );


    if (!match) {
        return null;
    }


    const amount =
        Number(match[0]);


    return Number.isFinite(amount)
        ? amount
        : null;
}


if (typeof globalThis !== "undefined") {

    globalThis.detectPrices =
        detectPrices;

    globalThis.detectCurrency =
        detectCurrency;

    globalThis.extractPriceAmount =
        extractPriceAmount;
}