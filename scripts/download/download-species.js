const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON,
    getIdFromUrl,
    formatGeneration,
    formatGameName,
    cleanFlavorText
} = require("../utils");

const { TOTAL_POKEMON } = require("../config");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/species.json"
);

async function downloadSpecies() {

    try {

        const speciesList = [];

        for (let id = 1; id <= TOTAL_POKEMON; id++) {

            console.log(`Downloading Species #${id}...`);

            const { data: species } = await axios.get(
                `https://pokeapi.co/api/v2/pokemon-species/${id}`
            );

            speciesList.push({

                id: species.id,

                name: toTitleCase(species.name),

                generation: formatGeneration(species.generation.name),

                category:
                    species.genera
                        .find(genus => genus.language.name === "en")
                        ?.genus || "Unknown",

                color: toTitleCase(
                    species.color.name
                ),

                shape: species.shape
                    ? toTitleCase(species.shape.name)
                    : "Unknown",

                habitat: species.habitat
                    ? toTitleCase(species.habitat.name)
                    : "Unknown",

                captureRate: species.capture_rate,

                baseFriendship: species.base_happiness,

                hatchCounter: species.hatch_counter,

                genderRate: species.gender_rate,

                growthRate: toTitleCase(
                    species.growth_rate.name
                ),

                legendary: species.is_legendary,

                mythical: species.is_mythical,

                baby: species.is_baby,

                evolutionChainId: getIdFromUrl(
                    species.evolution_chain.url
                ),
                
                eggGroups: species.egg_groups
                    .map(group => toTitleCase(group.name))
                    .sort(),

                entries: species.flavor_text_entries
                    .filter(entry =>
                        entry.language.name === "en"
                    )
                    .map(entry => ({
                    
                        game: formatGameName(entry.version.name),
                    
                        text: cleanFlavorText(
                            entry.flavor_text
                        )
                    
                    }))
                    .sort((a, b) =>
                        a.game.localeCompare(b.game)
                    )

            });

        }

        speciesList.sort((a, b) => a.id - b.id);

        saveJSON(
            OUTPUT_FILE,
            speciesList
        );

        console.log(
            `Successfully downloaded ${speciesList.length} Pokémon species.`
        );
    } catch (error) {

        console.error("Error downloading species:");

        console.error(error.message);

    }

}

downloadSpecies();