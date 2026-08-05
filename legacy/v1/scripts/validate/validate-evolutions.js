const {
    loadJSON
} = require("../utils/json");

const {
    printSuccess,
    printError
} = require("../utils/logger");

function validateEvolutions(
    {
        verbose = true
    } = {}
) {

    try {

        const evolutions =
            loadJSON(
                "generated/evolution-graph.json"
            );

        const speciesIds =
            new Set();

        for (const pokemon of evolutions) {

            if (speciesIds.has(pokemon.speciesId)) {

                throw new Error(
                    `Duplicate speciesId: ${pokemon.speciesId}`
                );

            }

            speciesIds.add(
                pokemon.speciesId
            );

            if (pokemon.stage < 1) {

                throw new Error(
                    `Invalid stage for species ${pokemon.speciesId}`
                );

            }

            if (
                pokemon.evolvesFrom ===
                pokemon.speciesId
            ) {

                throw new Error(
                    `Species ${pokemon.speciesId} evolves from itself`
                );

            }

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

        if (verbose) {

            printSuccess(
                `Validated ${evolutions.length} evolution records`
            );

        }

        return {

            success: true,

            count:
                evolutions.length

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Evolution validation failed"
            );

        }

        return {

            success: false,

            count: 0,

            error

        };

    }

}

module.exports = {

    validateEvolutions

};

if (require.main === module) {

    const result =
        validateEvolutions();

    if (!result.success) {

        process.exitCode = 1;

    }

}