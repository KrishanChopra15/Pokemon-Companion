const path = require("path");

const {
    DATABASE_DIR,
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    printPhase
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

function createSpeciesLookup(species) {

    return new Map(

        species.map(

            currentSpecies => [

                currentSpecies.id,

                currentSpecies

            ]

        )

    );

}

function generatePokemonIndex() {

    const pokemon = loadJSON(
        "pokemon.json"
    );

    const species = loadJSON(
        "species.json"
    );

    console.log(
        `Loaded ${pokemon.length} Pokémon`
    );

    console.log(
        `Loaded ${species.length} Species`
    );

    const speciesLookup =
        createSpeciesLookup(
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

                // Always use the National Dex number.
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

    console.log("");

    console.log(
        `Generated ${pokemonIndex.length} Pokémon index entries`
    );

    console.log(
        `Saved to ${OUTPUT_FILE}`
    );

    if (missingSpecies > 0) {

        console.log("");

        console.warn(
            `Skipped ${missingSpecies} Pokémon because their species could not be found.`
        );

    }

}

function main() {

    printPhase(
        "Phase 8 - Dataset Generation"
    );

    generatePokemonIndex();

}

main();