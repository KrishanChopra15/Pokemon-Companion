const path = require("path");

const {
    DATABASE_DIR,
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    printPhase
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

    return pokemon

        .filter(

            entry =>

                entry.category ===
                category

        )

        .sort(

            (a, b) =>

                a.speciesId -
                b.speciesId ||

                a.order -
                b.order

        )

        .map(
            createEntry
        );

}

function main() {

    printPhase(
        "Phase 8 - Category Index Generation"
    );

    const pokemon =
        loadJSON(
            INPUT_FILE
        );

    console.log(
        `Loaded ${pokemon.length} Pokémon`
    );

    console.log("");

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

    console.log("");

    console.log(
        "Category indexes generated successfully."
    );

}

main();