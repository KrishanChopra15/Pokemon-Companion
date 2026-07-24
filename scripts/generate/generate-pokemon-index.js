const path = require("path");

const {
    DATABASE_DIR,
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    createLookupMap
} = require("../utils/helpers");

const {
    printPhase,
    printSection,
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const {
    createPokemonMetadata,
    sortPokemonIndex
} = require("../utils/pokemon");

const OUTPUT_FILE = path.join(
    DATABASE_DIR,
    "generated",
    "pokemon-index.json"
);

function generatePokemonIndex() {

    const pokemon = loadJSON(
        "pokemon.json"
    );

    const species = loadJSON(
        "species.json"
    );

    printSection(
        `Loaded ${pokemon.length} Pokémon`
    );

    console.log(
        `Loaded ${species.length} Species`
    );

    const speciesLookup =
        createLookupMap(
            species
        );

    const pokemonIndex = [];

    let missingSpecies = 0;

    for (const currentPokemon of pokemon) {

        const currentSpecies =
            speciesLookup.get(
                currentPokemon.speciesId
            );

        if (!currentSpecies) {

            missingSpecies++;

            console.warn(
                `Missing species ${currentPokemon.speciesId} for Pokémon ${currentPokemon.id}`
            );

            continue;

        }

        pokemonIndex.push(

            createPokemonMetadata({

                ...currentPokemon,

                speciesName:
                    currentSpecies.name,

                number:
                    currentSpecies.number

            })

        );

    }

    sortPokemonIndex(
        pokemonIndex
    );

    saveJSON(
        OUTPUT_FILE,
        pokemonIndex
    );

    printSuccess(
        `Generated ${pokemonIndex.length} Pokémon index entries`
    );

    printOutputFile(
        OUTPUT_FILE
    );

    if (missingSpecies > 0) {

        console.warn(
            `Skipped ${missingSpecies} Pokémon because their species could not be found.`
        );

    }

}

function main() {

    try {

        printPhase(
            "Phase 8 - Dataset Generation"
        );

        generatePokemonIndex();

    } catch (error) {

        printError(
            error,
            "Error generating Pokémon index"
        );

    }

}

main();