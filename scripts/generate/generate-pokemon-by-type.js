const {
    generateRelationship
} = require("../utils/relationship");

const {
    printError,
    printPhase
} = require("../utils/logger");

function generatePokemonByType(
    {
        verbose = true
    } = {}
) {

    return generateRelationship({

        input:
            "pokemon.json",

        output:
            "pokemon-by-type.json",

        label:
            "Pokémon by Type",

        valuesSelector:
            pokemon => pokemon.types,

        verbose

    });

}

module.exports = {

    generatePokemonByType

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Pokémon by Type"
            );

            await generatePokemonByType();

        }

        catch (error) {

            printError(

                error,

                "Error generating Pokémon by Type"

            );

        }

    })();

}