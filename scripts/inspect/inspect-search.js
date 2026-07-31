const path = require("path");

const {
    loadJSONFile
} = require("../utils/json");

const DATABASE_DIRECTORY =
    path.resolve("database");

function loadDatabase(file) {

    return loadJSONFile(

        path.join(
            DATABASE_DIRECTORY,
            file
        )

    );

}

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

function normalizeName(value) {

    return String(value)

        .trim()

        .toLowerCase()

        .replace(/['.\-\s]/g, "");

}

function findById(entries, id) {

    return (

        entries.find(

            entry => entry.id === id

        ) ??

        null

    );

}

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

function findPokemon(query) {

    return findEntry(

        loadDatabase(
            "pokemon.json"
        ),

        query

    );

}

function findPokemonByAbility(
    abilityId
) {

    return getPokemon()

        .filter(

            pokemon =>

                pokemon.abilities.some(

                    ability =>

                        ability.id ===
                        abilityId

                )

        )

        .sort(
            (first, second) =>

                first.id -
                second.id
        );

}

function findAbility(query) {

    return findEntry(

        loadDatabase(
            "abilities.json"
        ),

        query

    );

}

function findMove(query) {

    return findEntry(

        loadDatabase(
            "moves.json"
        ),

        query

    );

}

function getPokemon() {

    return loadDatabase(
        "pokemon.json"
    );

}

module.exports = {

    findAbility,

    findById,

    findByName,

    findEntry,

    findMove,

    findPokemon,

    findPokemonByAbility,

    getPokemon,

    loadDatabase,

    normalizeId,

    normalizeName

};