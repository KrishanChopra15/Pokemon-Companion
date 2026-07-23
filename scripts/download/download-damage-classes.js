const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON,
    getIdFromUrl,
    getResourceList
} = require("../utils");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/damage-classes.json"
);

async function downloadDamageClasses() {

    try {

        const damageClasses = [];

        const damageClassList =
            await getResourceList(
                "move-damage-class"
            );

        for (const damageClassResource of damageClassList) {

            const id = getIdFromUrl(
                damageClassResource.url
            );

            console.log(
                `Downloading Damage Class #${id}...`
            );

            const {
                data: damageClass
            } = await axios.get(
                `https://pokeapi.co/api/v2/move-damage-class/${id}`
            );

            damageClasses.push({

                id: damageClass.id,

                name: toTitleCase(
                    damageClass.name
                )

            });

        }

        damageClasses.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            damageClasses
        );

        console.log(
            `Successfully downloaded ${damageClasses.length} damage classes.`
        );

    } catch (error) {

        console.error(
            "Error downloading damage classes:"
        );

        console.error(
            error.message
        );

    }

}

downloadDamageClasses();