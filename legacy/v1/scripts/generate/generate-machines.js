const fs = require("node:fs");
const path = require("node:path");

const {
    getGenerationDex
} = require(
    "../utils/loaders/showdown"
);

const {
    getMachineHistory
} = require(
    "./generate-machine-history"
);

const OUTPUT_PATH = path.join(
    __dirname,
    "../../database/generated/machines.json"
);

function getMoveIds() {

    const dex =
        getGenerationDex(9);

    return Object
        .keys(dex.data.Moves)
        .sort();

}

function generateMachines() {

    const moveIds =
        getMoveIds();

    console.log(getMoveIds().slice(0, 30));

    const machines = {};

    console.log(
        `Found ${moveIds.length} moves.`
    );

    for (const moveId of moveIds) {

        const history =
            getMachineHistory(
                moveId
            );

        if (

            Object.keys(
                history
            ).length === 0

        ) {

            continue;

        }

        machines[moveId] =
            history;

    }

    fs.mkdirSync(

        path.dirname(
            OUTPUT_PATH
        ),

        {
            recursive: true
        }

    );

    fs.writeFileSync(

        OUTPUT_PATH,

        JSON.stringify(
            machines,
            null,
            2
        )

    );

    console.log(

        `Successfully generated ${
            Object.keys(
                machines
            ).length
        } machine histories.`

    );

    console.log(
        `Output written to:\n${OUTPUT_PATH}`
    );

}

generateMachines();