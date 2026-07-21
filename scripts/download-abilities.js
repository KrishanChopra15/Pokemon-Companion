const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON,
    formatGeneration,
    cleanFlavorText,
    getIdFromUrl
} = require("./utils");

const { TOTAL_ABILITIES } = require("./config");

const metadata = require(
    "../database/metadata/ability-metadata.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../database/abilities.json"
);

async function downloadAbilities() {

    try {

        const abilities = [];

        for (let id = 1; id <= TOTAL_ABILITIES; id++) {

            console.log(`Downloading Ability #${id}...`);

            const { data: ability } = await axios.get(
                `https://pokeapi.co/api/v2/ability/${id}`
            );

            const effectEntry = ability.effect_entries.find(
                entry => entry.language.name === "en"
            );

            const flavorEntry = ability.flavor_text_entries.find(
                entry => entry.language.name === "en"
            );

            const abilityMetadata =
                metadata[toTitleCase(ability.name)] || {};

            abilities.push({

                id: ability.id,

                name: toTitleCase(ability.name),

                generation: formatGeneration(
                    ability.generation.name
                ),

                description: cleanFlavorText(
                    flavorEntry?.flavor_text
                ),

                shortEffect: cleanFlavorText(
                    effectEntry?.short_effect
                ),

                effect: cleanFlavorText(
                    effectEntry?.effect
                ),

                isMainSeries:
                    ability.is_main_series,

                pokemon:
                    ability.pokemon
                        .map(entry =>
                            getIdFromUrl(entry.pokemon.url)
                        )
                        .sort((a, b) => a - b),

                icon:
                    abilityMetadata.icon || null,

                color:
                    abilityMetadata.color || null

            });

        }

        abilities.sort((a, b) => a.id - b.id);

        saveJSON(
            OUTPUT_FILE,
            abilities
        );

        console.log(
            `Successfully downloaded ${abilities.length} abilities.`
        );

    } catch (error) {

        console.error("Error downloading abilities:");

        console.error(error.message);

    }

}

downloadAbilities();