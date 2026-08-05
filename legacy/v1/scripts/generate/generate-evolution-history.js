const {
    getSpeciesNumber
} = require(
    "../utils/loaders/species-loader"
);

const {
    normaliseEvolution
} = require(
    "../utils/normalisers/evolution"
);

const {
    fetchPokemonSpecies,
    fetchEvolutionChain
} = require(
    "../utils/loaders/pokeapi"
);

async function loadEvolutionChainForSpecies(
    speciesId
) {

    const speciesNumber =
        getSpeciesNumber(
            speciesId
        );
    
    const species =
        await fetchPokemonSpecies(
            speciesNumber
        );

    const chainId =

        species.evolution_chain.url

            .split("/")

            .filter(Boolean)

            .pop();

    return fetchEvolutionChain(
        chainId
    );

}

function buildHistory(
    node,
    history = {}
) {

    const name =
        node.species.name;

    history[name] ??= {

        species: name,

        evolutions: []

    };

    for (

        const child of node.evolves_to

    ) {

        const details =

            child.evolution_details[0] ??
            {};

        history[name]
            .evolutions
            .push({

                species:
                    child.species.name,

                details:

                    normaliseEvolution(
                        details
                    )

            });

        buildHistory(
            child,
            history
        );

    }

    return history;

}

async function getEvolutionHistory(
    speciesId
) {

    const chain =

        await loadEvolutionChainForSpecies(
            speciesId
        );

    return buildHistory(
        chain.chain
    );

}

module.exports = {

    loadEvolutionChainForSpecies,

    getEvolutionHistory

};