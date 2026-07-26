const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    toTitleCase
} = require("../utils/formatting");

const {
    sortById,
    createReferenceList,
    getMetadataEntry
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    createNamedApiReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const metadata = require(
    "../../database/metadata/type-metadata.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/types.json"
);

async function downloadTypes(
    {
        verbose = true
    } = {}
) {

    try {

        const typeResources =
            await getResourceList(
                "type"
            );

        const types = [];

        for (const typeResource of typeResources) {

            if (

                [
                    "unknown",
                    "shadow"
                ].includes(
                    typeResource.name
                )

            ) {

                continue;

            }

            if (verbose) {

                printVerbose(
                    `Downloading ${typeResource.name}...`
                );

            }

            const type =
                await getResource(
                    "type",
                    typeResource.name
                );

            const metadataEntry =
                getMetadataEntry(
                    metadata,
                    type.name
                );

            const damage =
                type.damage_relations;

            types.push({

                id:
                    type.id,

                name:
                    toTitleCase(
                        type.name
                    ),

                color:
                    metadataEntry.color ?? null,

                gradient:
                    metadataEntry.gradient ?? null,

                emoji:
                    metadataEntry.emoji ?? "",

                icon:
                    metadataEntry.icon ?? null,

                description:
                    metadataEntry.description ?? "",

                damageRelations: {

                    doubleDamageTo:
                        createReferenceList(
                            damage.double_damage_to,
                            createNamedApiReference
                        ),

                    halfDamageTo:
                        createReferenceList(
                            damage.half_damage_to,
                            createNamedApiReference
                        ),

                    noDamageTo:
                        createReferenceList(
                            damage.no_damage_to,
                            createNamedApiReference
                        ),

                    doubleDamageFrom:
                        createReferenceList(
                            damage.double_damage_from,
                            createNamedApiReference
                        ),

                    halfDamageFrom:
                        createReferenceList(
                            damage.half_damage_from,
                            createNamedApiReference
                        ),

                    noDamageFrom:
                        createReferenceList(
                            damage.no_damage_from,
                            createNamedApiReference
                        )

                }

            });

        }

        sortById(
            types
        );

        saveJSON(
            OUTPUT_FILE,
            types
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${types.length} Pokémon types`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                types.length,

            output:
                OUTPUT_FILE

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading types"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadTypes

};

if (require.main === module) {

    downloadTypes();

}