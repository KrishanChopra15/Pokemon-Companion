const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON,
    getResourceList,
    createNamedApiReference
} = require("../utils");

const metadata = require(
    "../../database/metadata/type-metadata.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/types.json"
);

async function downloadTypes() {

    try {

        const typeResources =
            await getResourceList(
                "type"
            );

        const types = [];

        for (const typeResource of typeResources) {

            if (
                ["unknown", "shadow"].includes(
                    typeResource.name
                )
            ) {

                continue;

            }

            console.log(
                `Downloading ${typeResource.name}...`
            );

            const {
                data: type
            } = await axios.get(
                typeResource.url
            );

            const metadataEntry =
                metadata[
                    toTitleCase(type.name)
                ] || {};

            const damage =
                type.damage_relations;

            types.push({

                id: type.id,

                name: toTitleCase(
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
                        damage.double_damage_to
                            .map(
                                createNamedApiReference
                            )
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            ),

                    halfDamageTo:
                        damage.half_damage_to
                            .map(
                                createNamedApiReference
                            )
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            ),

                    noDamageTo:
                        damage.no_damage_to
                            .map(
                                createNamedApiReference
                            )
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            ),

                    doubleDamageFrom:
                        damage.double_damage_from
                            .map(
                                createNamedApiReference
                            )
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            ),

                    halfDamageFrom:
                        damage.half_damage_from
                            .map(
                                createNamedApiReference
                            )
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            ),

                    noDamageFrom:
                        damage.no_damage_from
                            .map(
                                createNamedApiReference
                            )
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            )

                }

            });

        }

        types.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            types
        );

        console.log(
            `Successfully downloaded ${types.length} Pokémon types.`
        );

    } catch (error) {

        console.error(
            "Error downloading types:"
        );

        console.error(
            error.message
        );

    }

}

downloadTypes();