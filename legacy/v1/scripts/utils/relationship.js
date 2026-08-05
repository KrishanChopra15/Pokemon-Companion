const path = require("path");

const {
    DATABASE_DIR,
    loadJSON,
    saveJSON
} = require("./json");

const {
    printSection,
    printSuccess,
    printOutputFile,
    printError
} = require("./logger");

/**
 * Generates a relationship database.
 */
function generateRelationship({

    input,

    output,

    label,

    valuesSelector,

    keySelector = value => value,

    idSelector = entry => entry.id,

    normalizeKey = key => String(key),

    verbose = true

}) {

    try {

        const entries =
            loadJSON(
                input
            );

        if (verbose) {

            printSection(
                `Loaded ${entries.length} ${label}`
            );

        }

        const relationship = {};

        for (const entry of entries) {

            const id =
                idSelector(
                    entry
                );

            const values =
                valuesSelector(
                    entry
                ) ?? [];

            for (const value of values) {

                const key =
                    normalizeKey(
                        keySelector(value)
                    );

                if (!relationship[key]) {

                    relationship[key] = [];

                }

                relationship[key].push(
                    id
                );

            }

        }

        const outputFile =
            path.join(

                DATABASE_DIR,

                "generated",

                output

            );

        saveJSON(

            outputFile,

            relationship

        );

        if (verbose) {

            printSuccess(

                `Generated ${Object.keys(relationship).length} relationship entries`

            );

            printOutputFile(

                outputFile

            );

        }

        return {

            success: true,

            count:
                Object.keys(
                    relationship
                ).length,

            output:
                outputFile,

            message:

                `${Object.keys(relationship).length} relationship entries generated`

        };

    }

    catch (error) {

        if (verbose) {

            printError(

                error,

                `Error generating ${label.toLowerCase()}`

            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    generateRelationship

};