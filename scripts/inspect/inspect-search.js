const path = require("path");

const {
    loadJSONFile
} = require("../utils/json");

const DATABASE_DIRECTORY =
    path.resolve("database");

/**
 * Loads a database file.
 *
 * @param {string} file
 * @returns {Array|Object}
 */
function loadDatabase(file) {

    return loadJSONFile(

        path.join(
            DATABASE_DIRECTORY,
            file
        )

    );

}

/**
 * Normalizes an ID.
 *
 * Supports:
 * 25
 * 025
 * 00025
 * #25
 * #00025
 *
 * @param {string|number} value
 * @returns {number|null}
 */
function normalizeId(value) {

    const text =
        String(value)
            .trim()
            .replace(/^#/, "");

    if (!/^\d+$/.test(text)) {

        return null;

    }

    return Number(text);

}

/**
 * Normalizes a name.
 *
 * Examples:
 * Mr. Mime -> mrmime
 * Farfetch'd -> farfetchd
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeName(value) {

    return String(value)

        .trim()

        .toLowerCase()

        .replace(/['.\-\s]/g, "");

}

/**
 * Finds an entry by ID.
 *
 * @param {Array<Object>} entries
 * @param {number} id
 * @returns {Object|null}
 */
function findById(entries, id) {

    return (

        entries.find(

            entry => entry.id === id

        ) ??

        null

    );

}

/**
 * Finds an entry by name.
 *
 * @param {Array<Object>} entries
 * @param {string} name
 * @returns {Object|null}
 */
function findByName(entries, name) {

    const normalized =
        normalizeName(name);

    return (

        entries.find(

            entry =>

                typeof entry.name === "string" &&

                normalizeName(entry.name) === normalized

        ) ??

        null

    );

}

/**
 * Finds an entry by ID or name.
 *
 * @param {Array<Object>} entries
 * @param {string|number} query
 * @returns {Object|null}
 */
function findEntry(entries, query) {

    const id =
        normalizeId(query);

    if (id !== null) {

        const match =
            findById(
                entries,
                id
            );

        if (match) {

            return match;

        }

    }

    return findByName(
        entries,
        query
    );

}

/**
 * Finds a Pokémon.
 *
 * @param {string|number} query
 * @returns {Object|null}
 */
function findPokemon(query) {

    return findEntry(

        loadDatabase(
            "pokemon.json"
        ),

        query

    );

}

module.exports = {

    findById,

    findByName,

    findEntry,

    findPokemon,

    loadDatabase,

    normalizeId,

    normalizeName

};