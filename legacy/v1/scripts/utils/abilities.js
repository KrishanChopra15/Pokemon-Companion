/**
 * Creates the lightweight lookup object
 * used throughout the frontend.
 */

function createAbilityLookup(
    ability
) {

    return {

        id:
            ability.id,

        identifier:
            ability.identifier,

        name:
            ability.name,

        generationId:
            ability.generationId,

        isMainSeries:
            ability.isMainSeries

    };

}

module.exports = {

    createAbilityLookup

};