const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    formatApiName
} = require("../utils/formatting");

const {
    createReferenceList
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    createGenerationReference,
    createGameReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/version-groups.json"
);

async function downloadVersionGroups(
    {
        verbose = true
    } = {}
) {

    try {

        const versionGroups = [];

        const versionGroupResources =
            await getResourceList(
                "version-group"
            );

        for (const versionGroupResource of versionGroupResources) {

            if (verbose) {

                printVerbose(
                    `Downloading ${versionGroupResource.name}...`
                );

            }

            const versionGroup =
                await getResource(
                    "version-group",
                    versionGroupResource.name
                );

            const generation =
                createGenerationReference(
                    versionGroup.generation
                );

            versionGroups.push({

                id:
                    versionGroup.id,

                order:
                    versionGroup.order,

                generationOrder:
                    generation.id,

                apiName:
                    versionGroup.name,

                name:
                    formatApiName(
                        versionGroup.name
                    ),

                generation,

                games:
                    createReferenceList(
                        versionGroup.versions,
                        createGameReference
                    )

            });

        }

        versionGroups.sort(
            (a, b) =>
                a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            versionGroups
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${versionGroups.length} version groups`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                versionGroups.length,

            output:
                OUTPUT_FILE

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading version groups"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadVersionGroups

};

if (require.main === module) {

    downloadVersionGroups();

}