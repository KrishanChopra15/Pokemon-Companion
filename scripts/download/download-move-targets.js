const axios = require("axios");
const path = require("path");

const {
    formatApiName,
    saveJSON
} = require("../utils");

const {
    TOTAL_MOVE_TARGETS
} = require("../config");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/move-targets.json"
);

async function downloadMoveTargets() {

    try {

        const moveTargets = [];

        for (
            let id = 1;
            id <= TOTAL_MOVE_TARGETS;
            id++
        ) {

            console.log(
                `Downloading Move Target #${id}...`
            );

            const { data } = await axios.get(
                `https://pokeapi.co/api/v2/move-target/${id}`
            );

            const description = data.descriptions.find(
                entry => entry.language.name === "en"
            );

            moveTargets.push({

                id: data.id,

                name: formatApiName(
                    data.name
                ),

                description:
                    description?.description || ""

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

        console.error(error.message);

    }

}

downloadMoveTargets();