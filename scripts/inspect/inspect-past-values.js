const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    sortById
} = require("../utils/helpers");

const {
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/past-values.json"
);

async function inspectPastValues() {

    try {

        const results = [];

        console.log(
            "Fetching move list..."
        );

        const moveResources =
            await getResourceList(
                "move"
            );

        console.log(
            `Found ${moveResources.length} moves.\n`
        );

        for (const resource of moveResources) {

            const move =
                await getResource(
                    "move",
                    resource.name
                );

            console.log(
                `Inspecting ${move.name}...`
            );

            if (
                move.past_values.length === 0
            ) {

                continue;

            }

            results.push({

                id:
                    move.id,

                name:
                    move.name,

                current: {

                    power:
                        move.power,

                    accuracy:
                        move.accuracy,

                    pp:
                        move.pp,

                    effectChance:
                        move.effect_chance,

                    type:
                        move.type
                            ? move.type.name
                            : null

                },

                pastValues:
                    move.past_values

            });

        }

        sortById(
            results
        );

        saveJSON(
            OUTPUT_FILE,
            results
        );

        printSuccess(
            `Found ${results.length} moves with historical changes`
        );

        printOutputFile(
            OUTPUT_FILE
        );

    } catch (error) {

        printError(
            error,
            "Error inspecting moves"
        );

    }

}

inspectPastValues();