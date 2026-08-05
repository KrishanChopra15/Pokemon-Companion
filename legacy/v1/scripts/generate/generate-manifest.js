const path = require("path");

const manifest = require("../config/manifest");

const {
    buildManifestSection
} = require("../utils/manifest");

const {
    saveJSON
} = require("../utils/json");

/**
 * Generates the manifest file.
 *
 * @returns {{
 *     success: boolean,
 *     output?: string,
 *     message?: string,
 *     error?: Error
 * }}
 */
function generateManifest() {

    try {

        const databaseDirectory =
            path.resolve("database");

        const generatedDirectory =
            path.resolve("database/generated");

        const output =
            path.resolve(manifest.output);

        const data = {

            schemaVersion:
                manifest.schemaVersion,

            version:
                manifest.version,

            generatedAt:
                new Date().toISOString(),

            database:
                buildManifestSection(
                    databaseDirectory,
                    manifest.database
                ),

            generated:
                buildManifestSection(
                    generatedDirectory,
                    manifest.generated
                )

        };

        saveJSON(
            output,
            data
        );

        return {

            success: true,

            output,

            message:
                "Manifest generated successfully."

        };

    }
    catch (error) {

        return {

            success: false,

            error

        };

    }

}

module.exports = {
    generateManifest
};

if (require.main === module) {

    const result =
        generateManifest();

    if (!result.success) {

        console.error(result.error);

        process.exit(1);

    }

    console.log(result.message);

}