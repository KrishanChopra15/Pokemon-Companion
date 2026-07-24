const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON,
    getIdFromUrl,
    formatGameName,
    cleanFlavorText,
    getResourceList,
    getVersionGroupLookup,
    createGenerationReference,
    createNamedApiReference
} = require("../utils");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/species.json"
);

function createNationalDexNumber(id) {

    return `#${String(id).padStart(4, "0")}`;

}

async function downloadSpecies() {

    try {

        const speciesList = [];

        const speciesResources =
            await getResourceList(
                "pokemon-species"
            );

        const versionLookup =
            await getVersionGroupLookup();

        for (const speciesResource of speciesResources) {

            const id = getIdFromUrl(
                speciesResource.url
            );

            console.log(
                `Downloading Species #${id}...`
            );

            const {
                data: species
            } = await axios.get(
                `https://pokeapi.co/api/v2/pokemon-species/${id}`
            );

            const entries = species.flavor_text_entries

                .filter(
                    entry =>
                        entry.language.name === "en"
                )

                .map(entry => {

                    const versionGroup =
                        versionLookup.get(
                            entry.version.name
                        );

                    return {

                        order:
                            versionGroup?.order ??
                            Number.MAX_SAFE_INTEGER,

                        game:
                            formatGameName(
                                entry.version.name
                            ),

                        text:
                            cleanFlavorText(
                                entry.flavor_text
                            )

                    };

                })

                .sort(
                    (a, b) =>
                        a.order - b.order
                )

                .map(
                    ({ order, ...entry }) =>
                        entry
                );

            speciesList.push({

                id:
                    species.id,

                number:
                    createNationalDexNumber(
                        species.id
                    ),

                name:
                    toTitleCase(
                        species.name
                    ),

                generation:
                    createGenerationReference(
                        species.generation
                    ),

                category:

                    species.genera.find(

                        genus =>

                            genus.language.name === "en"

                    )?.genus ??

                    "Unknown",

                color:
                    createNamedApiReference(
                        species.color
                    ),

                shape:

                    species.shape

                        ? createNamedApiReference(
                            species.shape
                        )

                        : null,

                habitat:

                    species.habitat

                        ? createNamedApiReference(
                            species.habitat
                        )

                        : null,

                captureRate:
                    species.capture_rate,

                baseFriendship:
                    species.base_happiness,

                hatchCounter:
                    species.hatch_counter,

                genderRate:
                    species.gender_rate,

                growthRate:
                    createNamedApiReference(
                        species.growth_rate
                    ),

                legendary:
                    species.is_legendary,

                mythical:
                    species.is_mythical,

                baby:
                    species.is_baby,

                evolutionChainId:

                    species.evolution_chain

                        ? getIdFromUrl(
                            species.evolution_chain.url
                        )

                        : null,

                eggGroups:

                    species.egg_groups

                        .map(

                            group =>

                                createNamedApiReference(
                                    group
                                )

                        )

                        .sort(
                            (a, b) =>
                                a.id - b.id
                        ),

                entries

            });

        }

        speciesList.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            speciesList
        );

        console.log("");

        console.log(
            `Successfully downloaded ${speciesList.length} Pokémon species.`
        );

        console.log(
            `Saved to ${OUTPUT_FILE}`
        );

    } catch (error) {

        console.error("");

        console.error(
            "Error downloading species:"
        );

        console.error(
            error.message
        );

    }

}

downloadSpecies();