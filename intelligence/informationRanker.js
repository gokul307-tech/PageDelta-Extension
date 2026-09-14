/*
 * PageDelta
 * Information Ranking Engine
 */

const FIELD_PRIORITY = {

    name: 90,

    email: 90,

    phone: 80,

    address: 70,

    city: 60,

    state: 60,

    country: 60,

    postal_code: 60,

    username: 50,

    date: 50,

    number: 40,

    password: 30,

    unknown: 10
};


function rankFields(
    fields
) {

    if (!Array.isArray(fields)) {
        return [];
    }


    return [...fields]
        .map(field => {

            const baseScore =
                FIELD_PRIORITY[
                    field.fieldType
                ] || 10;


            const confidence =
                Number(
                    field.confidence || 0
                );


            const score =
                Math.round(
                    baseScore *
                    (confidence / 100)
                );


            return {

                ...field,

                rankScore:
                    score
            };
        })
        .sort(
            (a, b) =>
                b.rankScore -
                a.rankScore
        );
}


function rankInformation(
    analysis
) {

    if (!analysis) {
        return [];
    }


    const information = [];


    /*
     * Deadlines are highly important.
     */
    if (
        Array.isArray(
            analysis.deadlines
        )
    ) {

        analysis.deadlines.forEach(
            deadline => {

                information.push({

                    type: "deadline",

                    priority: 100,

                    data: deadline
                });
            }
        );
    }


    /*
     * Requirements.
     */
    if (
        Array.isArray(
            analysis.requirements
        )
    ) {

        analysis.requirements.forEach(
            requirement => {

                information.push({

                    type: "requirement",

                    priority: 80,

                    data: requirement
                });
            }
        );
    }


    /*
     * Actions.
     */
    if (
        Array.isArray(
            analysis.actions
        )
    ) {

        analysis.actions.forEach(
            action => {

                information.push({

                    type: "action",

                    priority: 70,

                    data: action
                });
            }
        );
    }


    return information.sort(
        (a, b) =>
            b.priority -
            a.priority
    );
}


if (typeof globalThis !== "undefined") {

    globalThis.FIELD_PRIORITY =
        FIELD_PRIORITY;

    globalThis.rankFields =
        rankFields;

    globalThis.rankInformation =
        rankInformation;
}