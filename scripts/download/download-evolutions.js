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
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/evolutions.json"
);

async function downloadEvolutions() {

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

            console.log(
                `Downloading Evolution Chain #${id}...`
            );

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

        printSuccess(
            `Downloaded ${evolutionChains.length} evolution chains`
        );

        printOutputFile(
            OUTPUT_FILE
        );

    } catch (error) {

        printError(
            error,
            "Error downloading evolution chains"
        );

    }

}

downloadEvolutions();