const {
    getGenerationDex,
    getSpecies
} = require(
    "./showdown"
);

/**
 * Checks whether a Dex entry is
 * an official base Pokémon species.
 *
 * Forms are intentionally excluded.
 * They will be handled by the separate
 * Forms pipeline later.
 *
 * @param {Object} species
 * @returns {boolean}
 */
function isBaseSpecies(
    species
) {

    return (

        species.exists &&

        species.num > 0 &&

        !species.forme &&

        species.isNonstandard !==
        "CAP"

    );

}

/**
 * Loads every base Pokémon species
 * available in a generation.
 *
 * @param {number} generation
 * @returns {Array<Object>}
 */
function loadSpecies(
    generation
) {

    return getGenerationDex(
        generation
    ).species.all().filter(
        isBaseSpecies
    );

}

/**
 * Gets every base species ID found
 * across Generations I through IX.
 *
 * @returns {Array<string>}
 */
function loadSpeciesIds() {

    const speciesIds =
        new Set();

    for (

        let generation = 1;

        generation <= 9;

        generation++

    ) {

        const species =
            loadSpecies(
                generation
            );

        for (const entry of species) {

            speciesIds.add(
                entry.id
            );

        }

    }

    return [

        ...speciesIds

    ].sort();

}

/**
 * Loads one Pokémon species as it
 * exists in the requested generation.
 *
 * @param {string} speciesId
 * @param {number} generation
 * @returns {Object}
 */
function loadSpeciesById(

    speciesId,

    generation

) {

    return getSpecies(
        speciesId,
        generation
    );

}

/**
 * Gets the National Dex number
 * for a Pokémon species.
 *
 * @param {string} speciesId
 * @returns {number}
 */
function getSpeciesNumber(
    speciesId
) {

    return getSpecies(
        speciesId,
        9
    ).num;

}

module.exports = {

    isBaseSpecies,
    loadSpecies,
    loadSpeciesIds,
    loadSpeciesById,
    getSpeciesNumber

};