const axios = require("axios");
const path = require("path");

const {
    saveJSON
} = require("../utils");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/past-values.json"
);

async function inspectPastValues() {

    try {

        const results = [];

        console.log("Fetching move list...");

        const { data } = await axios.get(
            "https://pokeapi.co/api/v2/move?limit=100000"
        );

        console.log(
            `Found ${data.results.length} moves.\n`
        );

        for (const resource of data.results) {

            const { data: move } = await axios.get(
                resource.url
            );

            console.log(
                `Inspecting ${move.name}...`
            );

            if (move.past_values.length === 0) {
                continue;
            }

            results.push({

                id: move.id,

                name: move.name,

                current: {

                    power: move.power,

                    accuracy: move.accuracy,

                    pp: move.pp,

                    effectChance: move.effect_chance,

                    type: move.type
                        ? move.type.name
                        : null

                },

                pastValues: move.past_values

            });

        }

        results.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            results
        );

        console.log("");

        console.log(
            `Found ${results.length} moves with historical changes.`
        );

        console.log(
            `Saved to ${OUTPUT_FILE}`
        );

    } catch (error) {

        console.error(
            "Error inspecting moves:"
        );

        console.error(error.message);

    }

}

inspectPastValues();