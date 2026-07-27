const {
    generateSearchIndex
} = require("../utils/searchIndex");

const {
    createPokemonSearchEntry,
    createSpeciesSearchEntry,
    createMoveSearchEntry,
    createAbilitySearchEntry,
    createItemSearchEntry,
    createTypeSearchEntry,
    createLocationSearchEntry
} = require("../utils/searchEntries");

const {
    printPhase,
    printError
} = require("../utils/logger");

function generateSearchIndexFile(
    {
        verbose = true
    } = {}
) {

    return generateSearchIndex({

        datasets: [

            {
                input:
                    "pokemon.json",

                label:
                    "Pokémon",

                createEntry:
                    createPokemonSearchEntry
            },

            {
                input:
                    "species.json",

                label:
                    "Species",

                createEntry:
                    createSpeciesSearchEntry
            },

            {
                input:
                    "moves.json",

                label:
                    "Moves",

                createEntry:
                    createMoveSearchEntry
            },

            {
                input:
                    "abilities.json",

                label:
                    "Abilities",

                createEntry:
                    createAbilitySearchEntry
            },

            {
                input:
                    "items.json",

                label:
                    "Items",

                createEntry:
                    createItemSearchEntry
            },

            {
                input:
                    "types.json",

                label:
                    "Types",

                createEntry:
                    createTypeSearchEntry
            },

            {
                input:
                    "locations.json",

                label:
                    "Locations",

                createEntry:
                    createLocationSearchEntry
            }

        ],

        output:
            "search-index.json",

        verbose

    });

}

module.exports = {

    generateSearchIndex:
        generateSearchIndexFile

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Search Index Generation"
            );

            await generateSearchIndexFile();

        }

        catch (error) {

            printError(
                error,
                "Error generating search index"
            );

        }

    })();

}