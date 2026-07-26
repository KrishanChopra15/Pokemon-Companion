const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    toTitleCase,
    formatGameName,
    cleanFlavorText,
    formatNationalDexNumber
} = require("../utils/formatting");

const {
    getIdFromUrl,
    findEnglishEntry,
    createReferenceList
} = require("../utils/helpers");

const {
    getResource,
    getResourceList,
    getVersionGroupLookup
} = require("../utils/api");

const {
    createGenerationReference,
    createNamedApiReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/species.json"
);

async function downloadSpecies(
    {
        verbose = true
    } = {}
) {

    try {

        const speciesList = [];

        const speciesResources =
            await getResourceList(
                "pokemon-species"
            );

        const versionLookup =
            await getVersionGroupLookup();

        for (const speciesResource of speciesResources) {

            const id =
                getIdFromUrl(
                    speciesResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Species #${id}...`
                );

            }

            const species =
                await getResource(
                    "pokemon-species",
                    id
                );

            const englishGenus =
                findEnglishEntry(
                    species.genera
                );

            const entries =
                species.flavor_text_entries

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
                    formatNationalDexNumber(
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
                    englishGenus?.genus ??
                    "Unknown",

                color:
                    createNamedApiReference(
                        species.color
                    ),

                shape:
                    createNamedApiReference(
                        species.shape
                    ),

                habitat:
                    createNamedApiReference(
                        species.habitat
                    ),

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
                    createReferenceList(
                        species.egg_groups,
                        createNamedApiReference
                    ),

                entries

            });

        }

        speciesList.sort(
            (a, b) =>
                a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            speciesList
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${speciesList.length} Pokémon species`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                speciesList.length,

            output:
                OUTPUT_FILE

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading species"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadSpecies

};

if (require.main === module) {

    downloadSpecies();

}