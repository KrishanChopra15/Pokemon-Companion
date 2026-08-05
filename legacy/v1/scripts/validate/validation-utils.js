const fs = require("fs");
const path = require("path");

const {
    DATABASE_DIR,
    errors
} = require("./validation-context");

function createIdLookup(
    ...files
) {

    const ids = new Set();

    for (const file of files) {

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        const data = JSON.parse(

            fs.readFileSync(
                filePath,
                "utf8"
            )

        );

        for (const entry of data) {

            ids.add(
                entry.id
            );

        }

    }

    return ids;

}

function validateUniqueIds(
    file,
    data
) {

    const ids = new Set();

    for (const entry of data) {

        if (entry.id === undefined) {

            errors.push(
                `${file} contains an entry without an ID.`
            );

            continue;

        }

        if (ids.has(entry.id)) {

            errors.push(
                `${file} contains duplicate ID ${entry.id}.`
            );

            continue;

        }

        ids.add(
            entry.id
        );

    }

}

function validateUniqueNames(
    file,
    data
) {

    const names = new Set();

    for (const entry of data) {

        if (entry.name === undefined) {

            continue;

        }

        if (names.has(entry.name)) {

            errors.push(
                `${file} contains duplicate name "${entry.name}".`
            );

            continue;

        }

        names.add(
            entry.name
        );

    }

}

function validateReference(
    file,
    source,
    field,
    value,
    lookup
) {

    if (

        value === null ||

        value === undefined

    ) {

        return;

    }

    if (

        !lookup.has(
            value
        )

    ) {

        errors.push(

            `${file}: ${source} has invalid ${field} ID ${value}.`

        );

    }

}

function validateNonNegativeNumber(
    file,
    entity,
    field,
    value,
    allowNull = false
) {

    if (value === null) {

        if (allowNull) {

            return;

        }

        errors.push(
            `${file}: ${entity} has null ${field}.`
        );

        return;

    }

    if (

        typeof value !== "number" ||

        value < 0

    ) {

        errors.push(
            `${file}: ${entity} has invalid ${field} ${value}.`
        );

    }

}

function validateRange(
    file,
    entity,
    field,
    value,
    min,
    max,
    allowNull = false
) {

    if (value === null) {

        if (allowNull) {

            return;

        }

        errors.push(
            `${file}: ${entity} has null ${field}.`
        );

        return;

    }

    if (

        typeof value !== "number" ||

        value < min ||

        value > max

    ) {

        errors.push(
            `${file}: ${entity} has invalid ${field} ${value}.`
        );

    }

}

function validateNotEmptyString(
    file,
    entity,
    field,
    value
) {

    if (

        typeof value !== "string" ||

        value.trim() === ""

    ) {

        errors.push(
            `${file}: ${entity} has empty ${field}.`
        );

    }

}

function validateChronologicalHistory(
    file,
    entity,
    history
) {

    let previousOrder = -1;

    const versionGroups =
        new Set();

    for (const entry of history) {

        const order =
            entry.versionGroup.order;

        if (

            versionGroups.has(
                order
            )

        ) {

            errors.push(

                `${file}: ${entity} contains duplicate version group ${entry.versionGroup.name}.`

            );

        }

        versionGroups.add(
            order
        );

        if (

            order < previousOrder

        ) {

            errors.push(

                `${file}: ${entity} history is not chronological.`

            );

        }

        previousOrder =
            order;

    }

}

module.exports = {

    createIdLookup,

    validateUniqueIds,

    validateUniqueNames,

    validateReference,

    validateNonNegativeNumber,

    validateRange,

    validateNotEmptyString,

    validateChronologicalHistory

};