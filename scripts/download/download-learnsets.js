const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    getIdFromUrl
} = require("../utils/helpers");

const {
    buildLearnsets
} = require("../utils/learnsets");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/learnsets.json"
);

async function downloadLearnsets(
    {
        verbose = true
    } = {}
) {

    try {

        const learnsets = [];

        const pokemonResources =
            await getResourceList(
                "pokemon"
            );

        for (const pokemonResource of pokemonResources) {

            const id =
                getIdFromUrl(
                    pokemonResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Learnset #${id}...`
                );

            }

            const pokemon =
                await getResource(
                    "pokemon",
                    id
                );

            learnsets.push({

                speciesId:
                    getIdFromUrl(
                        pokemon.species.url
                    ),

                moves:
                    buildLearnsets(
                        pokemon
                    )

            });

        }

        learnsets.sort(
            (a, b) =>
                a.speciesId - b.speciesId
        );

        saveJSON(
            OUTPUT_FILE,
            learnsets
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${learnsets.length} learnsets`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                learnsets.length,

            output:
                OUTPUT_FILE

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading learnsets"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadLearnsets

};

if (require.main === module) {

    downloadLearnsets();

}