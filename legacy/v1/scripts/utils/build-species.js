/**
 * Creates the lightweight lookup object
 * used throughout the frontend.
 */

function createSpeciesLookup(
    species
) {

    return {

        id:
            species.id,

        number:
            species.number,

        identifier:
            species.identifier,

        name:
            species.name,

        generationId:
            species.generationId,

        evolvesFromSpeciesId:
            species.evolvesFromSpeciesId,

        isBaby:
            species.isBaby,

        isLegendary:
            species.isLegendary,

        isMythical:
            species.isMythical

    };

}

module.exports = {

    createSpeciesLookup

};