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
 * Prints a section heading.
 *
 * @param {string} title
 */
function printInspectorSection(
    title
) {

    printSection(
        title
    );

}

/**
 * Prints a label/value field.
 *
 * @param {string} label
 * @param {*} value
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
 * Prints a list.
 *
 * @param {Array} values
 * @param {string|null} title
 */
function printList(
    values = [],
    title = null
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

    for (const value of values) {

        printBullet(
            value
        );

    }

}

/**
 * Prints a "not found" message.
 *
 * @param {string} type
 * @param {string} value
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

    printSection:
        printInspectorSection,

    printTypeList

};