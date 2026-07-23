const axios = require("axios");
const path = require("path");

const {
    saveJSON,
    formatApiName,
    getResourceList,
    createGenerationReference,
    createGameReference
} = require("../utils");

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

            const {
                data: versionGroup
            } = await axios.get(
                versionGroupResource.url
            );

            const generation =
                createGenerationReference(
                    versionGroup.generation
                );

            versionGroups.push({

                id: versionGroup.id,

                order: versionGroup.order,

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
                    versionGroup.versions
                        .map(
                            createGameReference
                        )
                        .sort(
                            (a, b) =>
                                a.id - b.id
                        )

            });

        }

        versionGroups.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            versionGroups
        );

        console.log(
            `Successfully downloaded ${versionGroups.length} version groups.`
        );

    } catch (error) {

        console.error(
            "Error downloading version groups:"
        );

        console.error(
            error.message
        );

    }

}

downloadVersionGroups();