const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    getIdFromUrl,
    sortById
} = require("../utils/helpers");

const {
    formatMachineName
} = require("../utils/formatting");

const {
    createNamedApiReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/machines.json"
);

async function downloadMachines(
    {
        verbose = true
    } = {}
) {

    try {

        const machines = [];

        const machineResources =
            await getResourceList(
                "machine"
            );

        for (const machineResource of machineResources) {

            const id =
                getIdFromUrl(
                    machineResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Machine #${id}...`
                );

            }

            const machine =
                await getResource(
                    "machine",
                    id
                );

            machines.push({

                id:
                    machine.id,

                item: {

                    id:
                        getIdFromUrl(
                            machine.item.url
                        ),

                    code:
                        formatMachineName(
                            machine.item.name
                        )

                },

                move:
                    createNamedApiReference(
                        machine.move
                    ),

                versionGroup:
                    createNamedApiReference(
                        machine.version_group
                    )

            });

        }

        sortById(
            machines
        );

        saveJSON(
            OUTPUT_FILE,
            machines
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${machines.length} machines`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                machines.length,

            output:
                OUTPUT_FILE

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading machines"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadMachines

};

if (require.main === module) {

    downloadMachines();

}