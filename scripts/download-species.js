const axios = require("axios");
const fs = require("fs");
const path = require("path");

const TOTAL_POKEMON = 10;

const OUTPUT_FILE = path.join(
    __dirname,
    "../database/species.json"
);

function formatGeneration(generation) {

    const generations = {

        "generation-i": "Generation I",
        "generation-ii": "Generation II",
        "generation-iii": "Generation III",
        "generation-iv": "Generation IV",
        "generation-v": "Generation V",
        "generation-vi": "Generation VI",
        "generation-vii": "Generation VII",
        "generation-viii": "Generation VIII",
        "generation-ix": "Generation IX"

    };

    return generations[generation] || generation;

}

function formatGameName(game) {

    const names = {

        "firered": "FireRed",
        "leafgreen": "LeafGreen",
        "heartgold": "HeartGold",
        "soulsilver": "SoulSilver",
        "lets-go-pikachu": "Let's Go Pikachu",
        "lets-go-eevee": "Let's Go Eevee",
        "omega-ruby": "Omega Ruby",
        "alpha-sapphire": "Alpha Sapphire",
        "black-2": "Black 2",
        "white-2": "White 2"

    };

    if (names[game]) return names[game];

    return game
        .split("-")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");

}

async function downloadSpecies() {

    const speciesList = [];

    for (let id = 1; id <= TOTAL_POKEMON; id++) {

        console.log(`Downloading Species #${id}...`);

        const response = await axios.get(
            `https://pokeapi.co/api/v2/pokemon-species/${id}`
        );

        const species = response.data;

        speciesList.push({

            id: species.id,

            generation: formatGeneration(species.generation.name),

            category:
                species.genera
                    .find(genus => genus.language.name === "en")
                    ?.genus || "Unknown",

            color:
                species.color.name
                    .replace(/\b\w/g, c => c.toUpperCase()),

            shape: species.shape
                ? species.shape.name.replace(/\b\w/g, c => c.toUpperCase())
                : "Unknown",

            habitat: species.habitat
                ? species.habitat.name.replace(/\b\w/g, c => c.toUpperCase())
                : "Unknown",

            captureRate: species.capture_rate,

            baseFriendship: species.base_happiness,

            hatchCounter: species.hatch_counter,

            genderRate: species.gender_rate,

            growthRate:
                species.growth_rate.name
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase()),

            legendary: species.is_legendary,

            mythical: species.is_mythical,

            baby: species.is_baby,

            eggGroups:
                species.egg_groups.map(group =>
                    group.name
                        .replace(/\b\w/g, c => c.toUpperCase())
                ),

            entries: species.flavor_text_entries
                .filter(entry =>
                    entry.language.name === "en"
                )
                .map(entry => ({

                    game: formatGameName(entry.version.name),

                    text: entry.flavor_text
                        .replace(/\f/g, " ")
                        .replace(/\n/g, " ")
                        .replace(/\s+/g, " ")
                        .replace(/POKéMON/g, "Pokémon")
                        .trim()

                }))

        });

    }

    fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify(speciesList, null, 4)
    );

    console.log("species.json created successfully!");
}

downloadSpecies();