const {
    generateLookup
} = require("../utils/lookup");

const {
    createPokemonLookup
} = require("../utils/pokemon");

function generatePokemonLookup(
    {
        verbose = true
    } = {}
) {

    return generateLookup({

        input:
            "pokemon.json",

        output:
            "pokemon-lookup.json",

        label:
            "Pokémon",

        createEntry:
            createPokemonLookup,

        verbose

    });

}