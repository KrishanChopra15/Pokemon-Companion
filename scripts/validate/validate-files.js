const fs = require("fs");
const path = require("path");

const {
    DATABASE_DIR,
    DATABASE_FILES,
    errors
} = require("./validation-context");

function validateFiles(
    {
        verbose = true
    } = {}
) {

    if (verbose) {

        console.log(
            "Phase 1 - Checking file existence..."
        );

    }

    for (const file of DATABASE_FILES) {

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        if (!fs.existsSync(filePath)) {

            errors.push(
                `Missing file: ${file}`
            );

            continue;

        }

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

function validateJson(
    {
        verbose = true
    } = {}
) {

    if (verbose) {

        console.log(
            "Phase 2 - Validating JSON..."
        );

    }

    for (const file of DATABASE_FILES) {

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        if (!fs.existsSync(filePath)) {

            continue;

        }

        try {

            const data = JSON.parse(
                fs.readFileSync(
                    filePath,
                    "utf8"
                )
            );

            const isHistory =
                file.startsWith(
                    "history/"
                );

            if (isHistory) {

                if (

                    Array.isArray(data) ||

                    data === null ||

                    typeof data !== "object"

                ) {

                    errors.push(
                        `${file} should contain an object.`
                    );

                    continue;

                }

            } else {

                if (!Array.isArray(data)) {

                    errors.push(
                        `${file} should contain an array.`
                    );

                    continue;

                }

            }

            if (

                (
                    Array.isArray(data) &&
                    data.length === 0
                ) ||

                (
                    !Array.isArray(data) &&
                    Object.keys(data).length === 0
                )

            ) {

                errors.push(
                    `${file} is empty.`
                );

                continue;

            }

            if (verbose) {

                console.log(
                    `✓ ${file}`
                );

            }

        } catch {

            errors.push(
                `${file} contains invalid JSON.`
            );

        }

    }

    if (verbose) {

        console.log("");

    }

}

module.exports = {

    validateFiles,

    validateJson

};