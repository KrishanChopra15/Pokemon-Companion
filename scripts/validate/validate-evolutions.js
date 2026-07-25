const path = require("path");

const {
    loadJSON
} = require("../utils/json");

const {
    printSuccess,
    printError
} = require("../utils/logger");

const INPUT_FILE = path.join(
    __dirname,
    "../../database/generated/evolution-graph.json"
);

function validateEvolutions() {

    try {

        const evolutions =
            loadJSON(
                "generated/evolution-graph.json"
            );

        const speciesIds =
            new Set();

        for (const pokemon of evolutions) {

            //
            // Species ID
            //

            if (speciesIds.has(pokemon.speciesId)) {

                throw new Error(
                    `Duplicate speciesId: ${pokemon.speciesId}`
                );

            }

            speciesIds.add(
                pokemon.speciesId
            );

            //
            // Stage
            //

            if (pokemon.stage < 1) {

                throw new Error(
                    `Invalid stage for species ${pokemon.speciesId}`
                );

            }

            //
            // Self evolution
            //

            if (
                pokemon.evolvesFrom ===
                pokemon.speciesId
            ) {

                throw new Error(
                    `Species ${pokemon.speciesId} evolves from itself`
                );

            }

            //
            // Duplicate evolution targets
            //

            const targets =
                new Set();

            for (const evolution of pokemon.evolvesTo) {

                if (
                    evolution.speciesId ===
                    pokemon.speciesId
                ) {

                    throw new Error(
                        `Species ${pokemon.speciesId} evolves into itself`
                    );

                }

                if (
                    targets.has(
                        evolution.speciesId
                    )
                ) {

                    throw new Error(
                        `Duplicate evolution target for species ${pokemon.speciesId}`
                    );

                }

                targets.add(
                    evolution.speciesId
                );

            }

        }

        //
        // Cross-reference validation
        //

        for (const pokemon of evolutions) {

            if (

                pokemon.evolvesFrom !== null &&

                !speciesIds.has(
                    pokemon.evolvesFrom
                )

            ) {

                throw new Error(
                    `Missing parent species ${pokemon.evolvesFrom}`
                );

            }

            for (const evolution of pokemon.evolvesTo) {

                if (

                    !speciesIds.has(
                        evolution.speciesId
                    )

                ) {

                    throw new Error(
                        `Missing evolution target ${evolution.speciesId}`
                    );

                }

            }

        }

        printSuccess(
            `Validated ${evolutions.length} evolution records`
        );

    }

    catch (error) {

        printError(
            error,
            "Evolution validation failed"
        );

    }

}

validateEvolutions();