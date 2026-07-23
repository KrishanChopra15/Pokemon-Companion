const axios = require("axios");
const path = require("path");

const {
    formatApiName,
    saveJSON,
    getIdFromUrl,
    getResourceList
} = require("../utils");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/move-targets.json"
);

async function downloadMoveTargets() {

    try {

        const moveTargets = [];

        const moveTargetList =
            await getResourceList(
                "move-target"
            );

        for (const moveTargetResource of moveTargetList) {

            const id = getIdFromUrl(
                moveTargetResource.url
            );

            console.log(
                `Downloading Move Target #${id}...`
            );

            const {
                data: moveTarget
            } = await axios.get(
                `https://pokeapi.co/api/v2/move-target/${id}`
            );

            const description =
                moveTarget.descriptions.find(
                    entry =>
                        entry.language.name === "en"
                );

            moveTargets.push({

                id: moveTarget.id,

                name: formatApiName(
                    moveTarget.name
                ),

                description:
                    description?.description ?? ""

            });

        }

        moveTargets.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            moveTargets
        );

        console.log(
            `Successfully downloaded ${moveTargets.length} move targets.`
        );

    } catch (error) {

        console.error(
            "Error downloading move targets:"
        );

        console.error(
            error.message
        );

    }

}

downloadMoveTargets();