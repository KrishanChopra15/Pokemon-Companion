const {
    printBullet,
    printDivider,
    printError,
    printLabelValue,
    printPhase,
    printSection
} = require("../utils/logger");

const {
    colourType
} = require(
    "../utils/pokemon-formatting"
);

/**
- Prints a section heading.
 *
- @param {string} title
 */
function printInspectorSection(
    title
) {

    printSection(
        title
    );

}

/**
- Prints a label/value field.
 *
- @param {string} label
- @param {*} value
 */
function printField(
    label,
    value,
    valueColour
) {

    printLabelValue(
        label,
        value,
        valueColour
    );

}

/**
- Prints wrapped paragraph text.
 *
- @param {string} text
- @param {number} maximumWidth
 */
function printParagraph(

    text,

    maximumWidth = 100

) {

    if (!text) {

        console.log(
            "  (none)"
        );

        return;

    }

    const terminalWidth =
        process.stdout.columns ??
        maximumWidth;

    const lineWidth =

        Math.min(

            terminalWidth,

            maximumWidth

        ) - 2;

    const words =
        String(text)

            .trim()

            .split(/\s+/);

    let line =
        "  ";

    for (const word of words) {

        const nextLine =
            line === "  "

                ? `  ${word}`

                : `${line} ${word}`;

        if (

            nextLine.length <=
            lineWidth

        ) {

            line =
                nextLine;

            continue;

        }

        console.log(
            line
        );

        line =
            `  ${word}`;

    }

    if (line !== "  ") {

        console.log(
            line
        );

    }

}

/**
- Prints a list.
 *
- @param {Array} values
- @param {string|null} title
- @param {number|null} limit
 */
function printList(

    values = [],

    title = null,

    limit = null

) {

    if (title) {

        console.log(
            title
        );

    }

    if (
        values.length === 0
    ) {

        printBullet(
            "(none)"
        );

        return;

    }

    const displayedValues =

        limit === null

            ? values

            : values.slice(
                0,
                limit
            );

    for (const value of displayedValues) {

        printBullet(
            value
        );

    }

    const remaining =
        values.length -
        displayedValues.length;

    if (remaining > 0) {

        printBullet(
            `… and ${remaining} more`
        );

    }

}

/**
- Prints a "not found" message.
 *
- @param {string} type
- @param {string} value
 */
function printNotFound(
    type,
    value
) {

    printError(
        new Error(
            `${type} "${value}" was not found.`
        ),
        "Not Found"
    );

}

function printTypeList(
    types
) {

    for (const type of types) {

        printBullet(
            colourType(
                type.name
            )
        );

    }

}

module.exports = {

    printDivider,

    printField,

    printList,

    printNotFound,

    printParagraph,

    printSection:
        printInspectorSection,

    printTypeList

};