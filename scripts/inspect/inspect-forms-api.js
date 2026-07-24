const fs = require("fs");
const path = require("path");

const fetch = global.fetch;

const OUTPUT_DIR = path.join(
    __dirname,
    "../../temp/forms-api"
);

fs.mkdirSync(
    OUTPUT_DIR,
    {
        recursive: true
    }
);

async function inspectForm(id) {

    console.log(`Inspecting form ${id}...`);

    const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon-form/${id}`
    );

    if (!response.ok) {

        console.log(
            `Form ${id} not found.`
        );

        return;

    }

    const data = await response.json();

    const outputFile = path.join(
        OUTPUT_DIR,
        `${id}.json`
    );

    fs.writeFileSync(
        outputFile,
        JSON.stringify(
            data,
            null,
            4
        )
    );

    console.log(
        `Saved ${id}.json`
    );

}

async function main() {

    const forms = [

        1,          // Bulbasaur

        10034,      // Mega Charizard X

        10035,      // Mega Charizard Y

        10159,      // Alolan Rattata

        10174,      // Galarian Meowth

        10230,      // Hisuian Zorua

        10250,      // Paldean Tauros

        10231,      // Hisuian Zoroark

        10195,      // Ash Greninja

        10195,      // Battle Form

        10228,      // Gigantamax sample (if exists)

    ];

    for (const id of forms) {

        try {

            await inspectForm(
                id
            );

        } catch (error) {

            console.log(
                error.message
            );

        }

    }

}

main();