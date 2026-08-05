const fs = require("node:fs");
const path = require("node:path");

const {
    loadSpeciesIds
} = require(
    "../utils/loaders/species-loader"
);

const {
    getSpeciesHistory
} = require(
    "./generate-species-history"
);

const OUTPUT_PATH = path.join(
    __dirname,
    "../../database/generated/species.json"
);

function generateSpecies() {

    const speciesIds =
        loadSpeciesIds();

    const species = {};

    console.log(
        `Found ${speciesIds.length} species.`
    );

    for (const speciesId of speciesIds) {

        const history =
            getSpeciesHistory(
                speciesId
            );

        if (

            Object.keys(
                history
            ).length === 0

        ) {

            continue;

        }

        species[speciesId] =
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
            species,
            null,
            2
        )

    );

    console.log(

        `Successfully generated ${
            Object.keys(
                species
            ).length
        } species histories.`

    );

    console.log(
        `Output written to:\n${OUTPUT_PATH}`
    );

}

generateSpecies();