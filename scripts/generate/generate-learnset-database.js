const path = require("path");

const {
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    printPhase,
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/generated/learnset-database.json"
);

/**
 * Creates an empty version object.
 */
function createVersion() {

    return {

        levelUp: [],

        machine: [],

        tutor: [],

        egg: [],

        special: [],

        train: [],

        formChange: [],

        purification: [],

        preEvolution: [],

        event: []

    };

}

/**
 * Sorts every learn method.
 */
function sortVersion(version) {

    version.levelUp.sort(
        (a, b) =>
            a.level - b.level ||
            a.moveId - b.moveId
    );

    version.machine.sort(
        (a, b) => a - b
    );

    version.tutor.sort(
        (a, b) => a - b
    );

    version.egg.sort(
        (a, b) => a - b
    );

    version.special.sort(
        (a, b) => a - b
    );

    version.train.sort(
        (a, b) => a - b
    );

    version.formChange.sort(
        (a, b) => a - b
    );

    version.purification.sort(
        (a, b) => a - b
    );

    version.preEvolution.sort(
        (a, b) => a - b
    );

    version.event.sort(
        (a, b) => a - b
    );

}

/**
 * Generates the frontend learnset database.
 */
function generateLearnsetDatabase(
    {
        verbose = true
    } = {}
) {

    try {

        const pokemonLearnsets =
            loadJSON(
                "learnsets.json"
            );

        const database = [];

        for (const pokemon of pokemonLearnsets) {

            const versions = {};

            for (const learn of pokemon.moves) {

                const versionId =
                    String(
                        learn.versionGroupId
                    );

                if (!versions[versionId]) {

                    versions[versionId] =
                        createVersion();

                }

                const version =
                    versions[versionId];

                switch (learn.method) {

                    case "level-up":

                        version.levelUp.push({

                            moveId:
                                learn.moveId,

                            level:
                                learn.level

                        });

                        break;

                    case "machine":

                        version.machine.push(
                            learn.moveId
                        );

                        break;

                    case "tutor":

                        version.tutor.push(
                            learn.moveId
                        );

                        break;

                    case "egg":

                        version.egg.push(
                            learn.moveId
                        );

                        break;

                    case "special":

                        version.special.push(
                            learn.moveId
                        );

                        break;

                    case "train":

                        version.train.push(
                            learn.moveId
                        );

                        break;

                    case "form-change":

                        version.formChange.push(
                            learn.moveId
                        );

                        break;

                    case "purification":

                        version.purification.push(
                            learn.moveId
                        );

                        break;

                    default:

                        break;

                }

            }

            for (const version of Object.values(
                versions
            )) {

                sortVersion(
                    version
                );

            }

            database.push({

                speciesId:
                    pokemon.speciesId,

                versions

            });

        }

        database.sort(
            (a, b) =>
                a.speciesId - b.speciesId
        );

        saveJSON(
            OUTPUT_FILE,
            database
        );

        if (verbose) {

            printSuccess(
                `Generated ${database.length} learnset databases`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                database.length,

            output:
                OUTPUT_FILE,

            message:
                `${database.length} learnset databases generated`

        };

    }

    catch (error) {

        if (verbose) {

            printError(
                error,
                "Error generating learnset database"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    generateLearnsetDatabase

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Phase 8 - Learnset Database Generation"
            );

            await generateLearnsetDatabase();

        } catch (error) {

            printError(
                error,
                "Error generating learnset database"
            );

        }

    })();

}