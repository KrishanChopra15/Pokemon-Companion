const {
    loadEvolutionChainForSpecies
} = require(
    "../utils/loaders/evolution-loader"
);

(async () => {

    const chain =
        await loadEvolutionChainForSpecies(
            "eevee"
        );

    console.log(
        chain.chain.species.name
    );

})();