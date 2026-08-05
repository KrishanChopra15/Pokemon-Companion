const path = require("path");

const {
    DATABASE_DIR,
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    printPhase,
    printSection,
    printSuccess,
    printOutputFile,
    printError
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

function buildCategoryIndex(
    pokemon,
    category
) {

    return pokemon

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

        );

}

function generateCategoryIndexes(
    {
        verbose = true
    } = {}
) {

    try {

        const pokemon =
            loadJSON(
                INPUT_FILE
            );

        if (verbose) {

            printSection(
                `Loaded ${pokemon.length} Pokémon`
            );

        }

        let generatedCount = 0;

        for (const category of CATEGORIES) {

            const index =
                buildCategoryIndex(
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

            generatedCount++;

            if (verbose) {

                console.log(
                    `${createOutputName(category)} (${index.length})`
                );

            }

        }

        if (verbose) {

            printSuccess(
                "Category indexes generated"
            );

            printOutputFile(
                OUTPUT_DIR
            );

        }

        return {

            success: true,

            count:
                generatedCount,

            output:
                OUTPUT_DIR,

            message:
                `${generatedCount} category indexes generated`

        };

    }

    catch (error) {

        if (verbose) {

            printError(
                error,
                "Error generating category indexes"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    generateCategoryIndexes

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Phase 8 - Category Index Generation"
            );

            await generateCategoryIndexes();

        }

        catch (error) {

            printError(
                error,
                "Error generating category indexes"
            );

        }

    })();

}