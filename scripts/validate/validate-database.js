const fs = require("fs");
const path = require("path");

const DATABASE_DIR = path.join(
    __dirname,
    "../../database"
);

const DATABASE_FILES = [

    "abilities.json",
    "damage-classes.json",
    "move-targets.json",
    "moves.json",
    "pokemon.json",
    "species.json",
    "types.json",
    "version-groups.json",

    "history/ability-history.json",
    "history/move-effect-history.json",
    "history/move-history.json"

];

const ENTITY_FILES = [

    {
        file: "abilities.json",
        uniqueName: true
    },

    {
        file: "damage-classes.json",
        uniqueName: true
    },

    {
        file: "move-targets.json",
        uniqueName: true
    },

    {
        file: "moves.json",
        uniqueName: true
    },

    {
        file: "pokemon.json",
        uniqueName: true
    },

    {
        file: "species.json",
        uniqueName: true
    },

    {
        file: "types.json",
        uniqueName: true
    },

    {
        file: "version-groups.json",
        uniqueName: true
    }

];

const errors = [];

function validateFiles() {

    console.log(
        "Phase 1 - Checking file existence..."
    );

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

        console.log(
            `✓ ${file}`
        );

    }

    console.log("");

}

function validateJson() {

    console.log(
        "Phase 2 - Validating JSON..."
    );

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

                (Array.isArray(data) &&
                    data.length === 0) ||

                (!Array.isArray(data) &&
                    Object.keys(data).length === 0)

            ) {

                errors.push(
                    `${file} is empty.`
                );

                continue;

            }

            console.log(
                `✓ ${file}`
            );

        } catch {

            errors.push(
                `${file} contains invalid JSON.`
            );

        }

    }

    console.log("");

}

function validateUniqueIds(
    file,
    data
) {

    const ids = new Set();

    for (const entry of data) {

        if (entry.id === undefined) {

            errors.push(
                `${file} contains an entry without an ID.`
            );

            continue;

        }

        if (ids.has(entry.id)) {

            errors.push(
                `${file} contains duplicate ID ${entry.id}.`
            );

            continue;

        }

        ids.add(
            entry.id
        );

    }

}

function validateUniqueNames(
    file,
    data
) {

    const names = new Set();

    for (const entry of data) {

        if (
            entry.name === undefined
        ) {

            continue;

        }

        if (
            names.has(entry.name)
        ) {

            errors.push(
                `${file} contains duplicate name "${entry.name}".`
            );

            continue;

        }

        names.add(
            entry.name
        );

    }

}

function validateDuplicateIds() {

    console.log(
        "Phase 3 - Checking duplicate IDs..."
    );

    for (const entity of ENTITY_FILES) {
    
        const file = entity.file;

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

        console.log(
            `✓ ${file}`
        );

    }

    console.log("");

}

function validateDuplicateNames() {

    console.log(
        "Phase 4 - Checking duplicate names..."
    );

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

        console.log(
            `✓ ${entity.file}`
        );

    }

    console.log("");

}

function validateReferences() {

    console.log(
        "Phase 5 - Reference validation (Coming Soon)\n"
    );

}

function validateHistory() {

    console.log(
        "Phase 6 - History validation (Coming Soon)\n"
    );

}

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

function main() {

    console.log(
        "\nStarting database validation...\n"
    );

    validateFiles();

    validateJson();

    validateDuplicateIds();

    validateDuplicateNames();

    validateReferences();

    validateHistory();

    printSummary();

}

main();