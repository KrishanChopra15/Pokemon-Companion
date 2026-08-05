const {
    loadEvolutionChainForSpecies
} = require(
    "../utils/loaders/pokeapi"
);

const TEST_POKEMON = [

    "bulbasaur",
    "eevee",
    "onix",
    "gloom",
    "kirlia",
    "inkay",
    "milcery",
    "bisharp",
    "primeape",
    "charcadet",
    "finizen",
    "gimmighoul"

];

async function inspect() {

    for (

        const species of TEST_POKEMON

    ) {

        console.log();
        console.log(
            "=".repeat(80)
        );

        console.log(
            species.toUpperCase()
        );

        console.log(
            "=".repeat(80)
        );

        const chain =
            await loadEvolutionChainForSpecies(
                species
            );

        console.dir(

            chain,

            {

                depth: null,

                colors: true

            }

        );

    }

}

inspect();