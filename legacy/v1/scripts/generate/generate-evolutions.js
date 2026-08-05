const fs = require("node:fs");
const path = require("node:path");

const {
    loadSpeciesIds
} = require(
    "../utils/loaders/species-loader"
);

const {
    getEvolutionHistory
} = require(
    "./generate-evolution-history"
);

const OUTPUT_PATH = path.join(
    __dirname,
    "../../database/generated/evolutions.json"
);

async function generateEvolutions() {

    const speciesIds =
        loadSpeciesIds();

    const evolutions = {};

    console.log(
        `Found ${speciesIds.length} species.`
    );

    for (const speciesId of speciesIds) {

        try {

            const history =
                await getEvolutionHistory(
                    speciesId
                );

            Object.assign(
                evolutions,
                history
            );

        } catch (error) {

            console.warn(
                `Failed to generate evolution chain for ${speciesId}`
            );

            console.warn(
                error.message
            );

        }

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
            evolutions,
            null,
            2
        )

    );

    console.log();

    console.log(

        `Generated ${
            Object.keys(
                evolutions
            ).length
        } evolution entries.`

    );

    console.log(
        `Saved to ${OUTPUT_PATH}`
    );

}

generateEvolutions();