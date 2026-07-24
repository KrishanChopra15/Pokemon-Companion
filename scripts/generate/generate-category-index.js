const path = require("path");

const {
    DATABASE_DIR,
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    sortByProperty
} = require("../utils/helpers");

const {
    printPhase,
    printSection,
    printSuccess,
    printOutputFile
} = require("../utils/logger");

const INPUT_FILE =
    "generated/pokemon-index.json";

const OUTPUT_DIR = path.join(
    DATABASE_DIR,
    "generated"
);

const CATEGORIES = [

    "Mega",

    "Regional",

    "Gigantamax",

    "Primal",

    "Totem",

    "Gender",

    "Forme",

    "Alternate"

];

function createOutputName(
    category
) {

    return (
        category
            .toLowerCase()
            .replace(/\s+/g, "-") +
        "-index.json"
    );

}

function createEntry(
    pokemon
) {

    return {

        pokemonId:
            pokemon.pokemonId,

        speciesId:
            pokemon.speciesId,

        number:
            pokemon.number,

        order:
            pokemon.order,

        name:
            pokemon.name,

        identifier:
            pokemon.identifier,

        displayName:
            pokemon.displayName,

        isDefault:
            pokemon.isDefault

    };

}

function generateCategoryIndex(
    pokemon,
    category
) {

    const index =
        pokemon

            .filter(
                entry =>
                    entry.category ===
                    category
            )

            .map(
                createEntry
            )

    .sort(
    
        (a, b) =>
        
            a.speciesId -
            b.speciesId ||
    
            a.order -
            b.order
    
    )

    return index;

}

function main() {

    printPhase(
        "Phase 8 - Category Index Generation"
    );

    const pokemon =
        loadJSON(
            INPUT_FILE
        );

    printSection(
        `Loaded ${pokemon.length} Pokémon`
    );

    for (const category of CATEGORIES) {

        const index =
            generateCategoryIndex(
                pokemon,
                category
            );

        const outputFile =
            path.join(

                OUTPUT_DIR,

                createOutputName(
                    category
                )

            );

        saveJSON(
            outputFile,
            index
        );

        console.log(

            `${createOutputName(category)} (${index.length})`

        );

    }

    printSuccess(
        "Category indexes generated"
    );

    printOutputFile(
        OUTPUT_DIR
    );

}

main();