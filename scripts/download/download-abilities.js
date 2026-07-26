const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    toTitleCase,
    cleanFlavorText
} = require("../utils/formatting");

const {
    getIdFromUrl,
    findEnglishEntry,
    sortById,
    getMetadataEntry
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    createPokemonReference,
    createGenerationReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const metadata = require(
    "../../database/metadata/ability-metadata.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/abilities.json"
);

async function downloadAbilities(
    {
        verbose = true
    } = {}
) {

    try {

        const abilities = [];

        const abilityResources =
            await getResourceList(
                "ability"
            );

        for (const abilityResource of abilityResources) {

            const id =
                getIdFromUrl(
                    abilityResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Ability #${id}...`
                );

            }

            const ability =
                await getResource(
                    "ability",
                    id
                );

            const effectEntry =
                findEnglishEntry(
                    ability.effect_entries
                );

            const flavorEntry =
                findEnglishEntry(
                    ability.flavor_text_entries
                );

            const metadataEntry =
                getMetadataEntry(
                    metadata,
                    ability.name
                );

            abilities.push({

                id:
                    ability.id,

                name:
                    toTitleCase(
                        ability.name
                    ),

                generation:
                    createGenerationReference(
                        ability.generation
                    ),

                description:
                    cleanFlavorText(
                        flavorEntry?.flavor_text
                    ),

                shortEffect:
                    cleanFlavorText(
                        effectEntry?.short_effect
                    ),

                effect:
                    cleanFlavorText(
                        effectEntry?.effect
                    ),

                isMainSeries:
                    ability.is_main_series,

                pokemon:
                    sortById(

                        ability.pokemon.map(

                            entry =>

                                createPokemonReference(
                                    entry.pokemon
                                )

                        )

                    ),

                icon:
                    metadataEntry.icon ?? null,

                color:
                    metadataEntry.color ?? null

            });

        }

        sortById(
            abilities
        );

        saveJSON(
            OUTPUT_FILE,
            abilities
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${abilities.length} abilities`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                abilities.length

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading abilities"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadAbilities

};

if (require.main === module) {

    downloadAbilities();

}