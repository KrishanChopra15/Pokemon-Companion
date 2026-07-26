const fs = require("fs");
const path = require("path");

const {
    DATABASE_DIR,
    ENTITY_FILES
} = require("./validation-context");

const {
    validateUniqueIds,
    validateUniqueNames
} = require("./validation-utils");

function validateDuplicateIds(
    {
        verbose = true
    } = {}
) {

    if (verbose) {

        console.log(
            "Phase 3 - Checking duplicate IDs..."
        );

    }

    for (const entity of ENTITY_FILES) {

        const file =
            entity.file;

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        const data = JSON.parse(
            fs.readFileSync(
                filePath,
                "utf8"
            )
        );

        validateUniqueIds(
            file,
            data
        );

        if (verbose) {

            console.log(
                `✓ ${file}`
            );

        }

    }

    if (verbose) {

        console.log("");

    }

}

function validateDuplicateNames(
    {
        verbose = true
    } = {}
) {

    if (verbose) {

        console.log(
            "Phase 4 - Checking duplicate names..."
        );

    }

    for (const entity of ENTITY_FILES) {

        if (!entity.uniqueName) {

            continue;

        }

        const filePath = path.join(
            DATABASE_DIR,
            entity.file
        );

        const data = JSON.parse(
            fs.readFileSync(
                filePath,
                "utf8"
            )
        );

        validateUniqueNames(
            entity.file,
            data
        );

        if (verbose) {

            console.log(
                `✓ ${entity.file}`
            );

        }

    }

    if (verbose) {

        console.log("");

    }

}

module.exports = {

    validateDuplicateIds,

    validateDuplicateNames

};