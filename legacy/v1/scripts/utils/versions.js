/**
 * Validation Utilities
 *
 * Shared validation helpers used by
 * generators, inspectors and validators.
 */

/* ---------------------------------- */
/* Assertions                         */
/* ---------------------------------- */

function assertArray(
    value,
    name = "Value"
) {

    if (!Array.isArray(value)) {

        throw new Error(
            `${name} must be an array.`
        );

    }

}

function assertObject(
    value,
    name = "Value"
) {

    if (

        value === null ||

        typeof value !== "object" ||

        Array.isArray(value)

    ) {

        throw new Error(
            `${name} must be an object.`
        );

    }

}

function assertPositiveInteger(
    value,
    name = "Value"
) {

    if (

        !Number.isInteger(value) ||

        value <= 0

    ) {

        throw new Error(
            `${name} must be a positive integer.`
        );

    }

}

/* ---------------------------------- */
/* Duplicate Validation               */
/* ---------------------------------- */

function assertUniqueIds(
    array,
    field = "id"
) {

    assertArray(
        array,
        "Array"
    );

    const seen =
        new Set();

    for (const item of array) {

        const value =
            item[field];

        if (
            seen.has(value)
        ) {

            throw new Error(

                `Duplicate ${field}: ${value}`

            );

        }

        seen.add(value);

    }

}

/* ---------------------------------- */
/* Sorting Validation                 */
/* ---------------------------------- */

function assertSorted(

    array,

    field

) {

    assertArray(
        array,
        "Array"
    );

    for (

        let index = 1;

        index < array.length;

        index++

    ) {

        if (

            array[index][field] <

            array[index - 1][field]

        ) {

            throw new Error(

                `Array is not sorted by "${field}".`

            );

        }

    }

}

/* ---------------------------------- */
/* Required Fields                    */
/* ---------------------------------- */

function assertRequiredFields(

    object,

    fields

) {

    assertObject(
        object,
        "Object"
    );

    for (const field of fields) {

        if (

            object[field] ===

            undefined

        ) {

            throw new Error(

                `Missing required field "${field}".`

            );

        }

    }

}

/* ---------------------------------- */
/* Reference Validation               */
/* ---------------------------------- */

function assertReferenceExists(

    reference,

    lookup,

    name = "Reference"

) {

    if (

        reference == null ||

        !lookup.has(reference)

    ) {

        throw new Error(

            `${name} "${reference}" does not exist.`

        );

    }

}

/* ---------------------------------- */
/* Duplicate Finder                   */
/* ---------------------------------- */

function findDuplicateValues(

    array,

    field

) {

    const seen =
        new Set();

    const duplicates =
        new Set();

    for (const item of array) {

        const value =
            item[field];

        if (

            seen.has(value)

        ) {

            duplicates.add(
                value
            );

        }

        seen.add(
            value
        );

    }

    return [

        ...duplicates

    ];

}

module.exports = {

    assertArray,

    assertObject,

    assertPositiveInteger,

    assertUniqueIds,

    assertSorted,

    assertRequiredFields,

    assertReferenceExists,

    findDuplicateValues

};