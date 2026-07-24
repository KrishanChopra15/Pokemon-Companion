/**
 * Helper Utilities
 *
 * Generic helper functions used throughout
 * the data pipeline.
 */

const {
    toTitleCase
} = require("./formatting");

/* ---------------------------------- */
/* Arrays                             */
/* ---------------------------------- */

/**
 * Checks whether an array of flags
 * contains a specific flag.
 *
 * Example:
 * hasFlag(flags, "is_default")
 */
function hasFlag(
    flags,
    name
) {

    return (flags ?? []).some(
        flag => flag.name === name
    );

}

/* ---------------------------------- */
/* URLs                               */
/* ---------------------------------- */

/**
 * Extracts the numeric ID from
 * a PokéAPI URL.
 *
 * Example:
 * https://pokeapi.co/api/v2/type/10/
 * -> 10
 */
function getIdFromUrl(
    url
) {

    if (!url) {

        return null;

    }

    return Number(

        url

            .split("/")

            .filter(Boolean)

            .pop()

    );

}

/* ---------------------------------- */
/* Maps                               */
/* ---------------------------------- */

/**
 * Creates a lookup Map using the
 * object's id as the key.
 *
 * Optionally merges a legacy array.
 */
function createLookupMap(

    primary = [],

    key = "id",

    legacy = []

) {

    return new Map([

        ...primary

            .filter(item => item?.[key] != null)

            .map(item => [

                item[key],

                item

            ]),

        ...legacy

            .filter(item => item?.[key] != null)

            .map(item => [

                item[key],

                item

            ])

    ]);

}

/* ---------------------------------- */
/* Objects                            */
/* ---------------------------------- */

/**
 * Returns true if the value
 * is null or undefined.
 */
function isNil(
    value
) {

    return value == null;

}

/**
 * Returns true if the object
 * has no own properties.
 */
function isEmptyObject(
    object
) {

    return (

        object &&

        Object.keys(object).length === 0

    );

}

function findEnglishEntry(
    entries = []
) {

    return entries.find(
        entry =>
            entry.language?.name === "en"
    );

}

function createReferenceList(

    resources = [],

    builder

) {

    return sortById(

        resources.map(
            builder
        )

    );

}

function getMetadataEntry(
    metadata,
    key
) {

    return metadata[
        toTitleCase(key)
    ] ?? {};

}

function sortByProperty(
    array = [],
    property,
    direction = "asc"
) {

    return array.sort((a, b) => {

        const first = a?.[property];
        const second = b?.[property];

        let result;

        if (
            typeof first === "number" &&
            typeof second === "number"
        ) {

            result = first - second;

        } else {

            result = String(first).localeCompare(
                String(second)
            );

        }

        return direction === "desc"
            ? -result
            : result;

    });

}

function sortById(
    array
) {

    return sortByProperty(
        array,
        "id"
    );

}

module.exports = {

    hasFlag,

    getIdFromUrl,

    createLookupMap,

    isNil,

    isEmptyObject,

    findEnglishEntry,

    createReferenceList,

    getMetadataEntry,

    sortByProperty,

    sortById

};