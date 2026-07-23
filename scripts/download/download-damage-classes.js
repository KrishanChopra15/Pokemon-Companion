const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON
} = require("../utils");

const {
    TOTAL_DAMAGE_CLASSES
} = require("../config");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/damage-classes.json"
);

async function downloadDamageClasses() {

    try {

        const damageClasses = [];

        for (
            let id = 1;
            id <= TOTAL_DAMAGE_CLASSES;
            id++
        ) {

            console.log(
                `Downloading Damage Class #${id}...`
            );

            const { data } = await axios.get(
                `https://pokeapi.co/api/v2/move-damage-class/${id}`
            );

            damageClasses.push({

                id: data.id,

                name: toTitleCase(data.name)

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

        console.error(error.message);

    }

}

downloadDamageClasses();