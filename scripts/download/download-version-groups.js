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
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/version-groups.json"
);

async function downloadVersionGroups() {

    try {

        const versionGroups = [];

        const versionGroupResources =
            await getResourceList(
                "version-group"
            );

        for (const versionGroupResource of versionGroupResources) {

            console.log(
                `Downloading ${versionGroupResource.name}...`
            );

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

        printSuccess(
            `Downloaded ${versionGroups.length} version groups`
        );

        printOutputFile(
            OUTPUT_FILE
        );

    } catch (error) {

        printError(
            error,
            "Error downloading version groups"
        );

    }

}

downloadVersionGroups();