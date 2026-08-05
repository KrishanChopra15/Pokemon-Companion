const {
    getGenerationDex,
    getSpecies
} = require(
    "./showdown"
);

/**
 * Checks whether a Dex entry is
 * an official alternate Pokémon form.
 *
 * @param {Object} species
 * @returns {boolean}
 */
function isForm(
    species
) {

    return (

        species.exists &&

        species.num > 0 &&

        Boolean(
            species.forme
        ) &&

        species.isNonstandard !==
        "CAP"

    );

}

/**
 * Loads every official Pokémon form
 * available in a generation.
 *
 * @param {number} generation
 * @returns {Array<Object>}
 */
function loadForms(
    generation
) {

    return getGenerationDex(
        generation
    ).species.all().filter(
        isForm
    );

}

/**
 * Gets every form ID found across
 * Generations I through IX.
 *
 * @returns {Array<string>}
 */
function loadFormIds() {

    const formIds =
        new Set();

    for (

        let generation = 1;

        generation <= 9;

        generation++

    ) {

        const forms =
            loadForms(
                generation
            );

        for (const form of forms) {

            formIds.add(
                form.id
            );

        }

    }

    return [

        ...formIds

    ].sort();

}

/**
 * Loads one Pokémon form as it exists
 * in the requested generation.
 *
 * @param {string} formId
 * @param {number} generation
 * @returns {Object}
 */
function loadForm(

    formId,

    generation

) {

    return getSpecies(
        formId,
        generation
    );

}

module.exports = {

    isForm,
    loadForm,
    loadFormIds,
    loadForms

};