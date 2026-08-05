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

const {
    sortSearchEntries
} = require("./search");

/**
 * Generates a search index.
 */
function generateSearchIndex({

    datasets,

    output,

    verbose = true

}) {

    try {

        const entries = [];

        for (const {

            input,

            label,

            createEntry

        } of datasets) {

            const records =
                loadJSON(
                    input
                );

            if (verbose) {

                printSection(
                    `Loaded ${records.length} ${label}`
                );

            }

            for (const record of records) {

                entries.push(

                    createEntry(
                        record
                    )

                );

            }

        }

        sortSearchEntries(
            entries
        );

        const outputFile =
            path.join(

                DATABASE_DIR,

                "generated",

                output

            );

        saveJSON(

            outputFile,

            entries

        );

        if (verbose) {

            printSuccess(

                `Generated ${entries.length} search entries`

            );

            printOutputFile(

                outputFile

            );

        }

        return {

            success: true,

            count:
                entries.length,

            output:
                outputFile,

            message:
                `${entries.length} search entries generated`

        };

    }

    catch (error) {

        if (verbose) {

            printError(

                error,

                "Error generating search index"

            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    generateSearchIndex

};