const {
    getSpecies
} = require(
    "../utils/loaders/showdown"
);

const {
    normaliseSpecies
} = require(
    "../utils/normalisers/species"
);

function getSpeciesHistory(
    speciesId
) {

    const history = {};

    for (

        let generation = 1;

        generation <= 9;

        generation++

    ) {

        const species =
            getSpecies(
                speciesId,
                generation
            );

        if (

            !species.exists ||

            species.gen > generation

        ) {

            continue;

        }

        history[generation] =
            normaliseSpecies(
                species,
                generation
            );

    }

    return history;

}

module.exports = {

    getSpeciesHistory

};