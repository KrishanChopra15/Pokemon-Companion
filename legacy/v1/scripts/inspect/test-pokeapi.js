const {
    fetchEvolutionChain
} = require(
    "../utils/loaders/pokeapi"
);

(async () => {

    const chain =
        await fetchEvolutionChain(1);

    console.log(
        chain.chain.species.name
    );

})();