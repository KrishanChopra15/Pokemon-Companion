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
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/evolutions.json"
);

async function downloadEvolutions(
    {
        verbose = true
    } = {}
) {

    try {

        const evolutionChains = [];

        const evolutionResources =
            await getResourceList(
                "evolution-chain"
            );

        for (const evolutionResource of evolutionResources) {

            const id =
                getIdFromUrl(
                    evolutionResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Evolution Chain #${id}...`
                );

            }

            const evolutionChain =
                await getResource(
                    "evolution-chain",
                    id
                );

            evolutionChains.push(
                evolutionChain
            );

        }

        saveJSON(
            OUTPUT_FILE,
            evolutionChains
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${evolutionChains.length} evolution chains`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                evolutionChains.length,

            output:
                OUTPUT_FILE

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading evolution chains"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadEvolutions

};

if (require.main === module) {

    downloadEvolutions();

}