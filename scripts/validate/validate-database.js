const {
    validateFiles,
    validateJson
} = require("./validate-files");

const {
    validateDuplicateIds,
    validateDuplicateNames
} = require("./validate-duplicates");

const {
    validateReferences
} = require("./validate-references");

const {
    validateIntegrity
} = require("./validate-integrity");

const {
    validateHistory
} = require("./validate-history");

const {
    errors
} = require("./validation-context");

function printSummary() {

    console.log(
        "========================================"
    );

    if (errors.length === 0) {

        console.log(
            "✅ Database validation passed."
        );

    } else {

        console.log(
            `❌ Database validation failed with ${errors.length} error(s).\n`
        );

        for (const error of errors) {

            console.log(
                `• ${error}`
            );

        }

        process.exitCode = 1;

    }

}

function validateDatabase(
    {
        verbose = true
    } = {}
) {

    errors.length = 0;

    if (verbose) {

        console.log(
            "\nStarting database validation...\n"
        );

    }

    validateFiles({
        verbose
    });

    validateJson({
        verbose
    });

    validateDuplicateIds({
        verbose
    });

    validateDuplicateNames({
        verbose
    });

    validateReferences({
        verbose
    });

    validateIntegrity({
        verbose
    });

    validateHistory({
        verbose
    });

    if (verbose) {

        printSummary();

    }

    return {

        success:
            errors.length === 0,

        errors:
            errors.length

    };

}

module.exports = {

    validateDatabase

};

if (require.main === module) {

    validateDatabase();

}