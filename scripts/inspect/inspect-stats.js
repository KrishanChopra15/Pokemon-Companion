const path = require("path");

const {
    loadJSONFile
} = require("../utils/json");

const {
    printField,
    printSection
} = require("./inspect-utils");

function inspectStats() {

    const manifest = loadJSONFile(

        path.resolve(
            "database/generated/manifest.json"
        )

    );

    printHeading(
        "📊 Pokémon Companion Statistics"
    );

    printSection(
        "Database"
    );

    for (

        const [key, value]

        of Object.entries(
            manifest.database
        )

    ) {

        printField(
            key,
            value.entries.toLocaleString()
        );

    }

    console.log();

    printSection(
        "Generated"
    );

    for (

        const [key, value]

        of Object.entries(
            manifest.generated
        )

    ) {

        printField(
            key,
            value.entries.toLocaleString()
        );

    }

    console.log();

    printSection(
        "Build"
    );

    printField(
        "Version",
        manifest.version
    );

    printField(
        "Schema",
        manifest.schemaVersion
    );

    printField(
        "Generated",
        manifest.generatedAt
    );

}

module.exports = {

    inspectStats

};