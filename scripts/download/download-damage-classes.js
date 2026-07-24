const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    toTitleCase
} = require("../utils/formatting");

const {
    getIdFromUrl
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/damage-classes.json"
);

async function downloadDamageClasses() {

    try {

        const damageClasses = [];

        const damageClassResources =
            await getResourceList(
                "move-damage-class"
            );

        for (const damageClassResource of damageClassResources) {

            const id =
                getIdFromUrl(
                    damageClassResource.url
                );

            console.log(
                `Downloading Damage Class #${id}...`
            );

            const damageClass =
                await getResource(
                    "move-damage-class",
                    id
                );

            damageClasses.push({

                id:
                    damageClass.id,

                name:
                    toTitleCase(
                        damageClass.name
                    )

            });

        }

        damageClasses.sort(
            (a, b) =>
                a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            damageClasses
        );

        printSuccess(
            `Downloaded ${damageClasses.length} damage classes`
        );

        printOutputFile(
            OUTPUT_FILE
        );

    } catch (error) {

        printError(
            error,
            "Error downloading damage classes"
        );

    }

}

downloadDamageClasses();