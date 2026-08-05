const {
    fetchEvolutionChain,
    fetchPokemonSpecies
} = require(
    "./pokeapi"
);

async function loadEvolutionChain(
    id
) {

    return fetchEvolutionChain(
        id
    );

}

async function loadSpecies(
    id
) {

    return fetchPokemonSpecies(
        id
    );

}

async function loadEvolutionChainForSpecies(
    species
) {

    const speciesData =
        await loadSpecies(
            species
        );

    const url =
        speciesData.evolution_chain.url;

    const chainId =
        Number(

            url
                .split("/")
                .filter(Boolean)
                .pop()

        );

    return loadEvolutionChain(
        chainId
    );

}

module.exports = {

    loadEvolutionChain,

    loadSpecies,

    loadEvolutionChainForSpecies

};