const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    formatApiName
} = require("../utils/formatting");

const {
    getIdFromUrl,
    findEnglishEntry
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/move-targets.json"
);

async function downloadMoveTargets(
    {
        verbose = true
    } = {}
) {

    try {

        const moveTargets = [];

        const moveTargetResources =
            await getResourceList(
                "move-target"
            );

        for (const moveTargetResource of moveTargetResources) {

            const id =
                getIdFromUrl(
                    moveTargetResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Move Target #${id}...`
                );

            }

            const moveTarget =
                await getResource(
                    "move-target",
                    id
                );

            const description =
                findEnglishEntry(
                    moveTarget.descriptions
                );

            moveTargets.push({

                id:
                    moveTarget.id,

                name:
                    formatApiName(
                        moveTarget.name
                    ),

                description:
                    description?.description ?? ""

            });

        }

        moveTargets.sort(
            (a, b) =>
                a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            moveTargets
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${moveTargets.length} move targets`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                moveTargets.length

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading move targets"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadMoveTargets

};

if (require.main === module) {

    downloadMoveTargets();

}