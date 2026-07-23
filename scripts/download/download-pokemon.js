const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON,
    getIdFromUrl
} = require("../utils");

const { TOTAL_POKEMON } = require("../config");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/pokemon.json"
);

async function downloadPokemon() {

    try {

        const pokemonList = [];

        for (let id = 1; id <= TOTAL_POKEMON; id++) {

            console.log(`Downloading Pokémon #${id}...`);

            const { data: pokemon } = await axios.get(
                `https://pokeapi.co/api/v2/pokemon/${id}`
            );

            const sprites = pokemon.sprites;

            const artwork = sprites.other;

            const stats = pokemon.stats;

            const types = pokemon.types;

            const abilities = pokemon.abilities;

            pokemonList.push({

                id: pokemon.id,

                speciesId: getIdFromUrl(
                    pokemon.species.url
                ),

                order: pokemon.order,

                number: `#${String(pokemon.id).padStart(4, "0")}`,

                name: toTitleCase(pokemon.name),

                height: pokemon.height / 10,

                weight: pokemon.weight / 10,

                artwork: {
                
                    official:
                        artwork["official-artwork"].front_default,
                
                    home:
                        artwork.home.front_default,
                
                    dreamWorld:
                        artwork.dream_world.front_default
                
                },

                sprites: {
                
                    front: sprites.front_default,
                
                    back: sprites.back_default,
                
                    frontShiny: sprites.front_shiny,
                
                    backShiny: sprites.back_shiny
                
                },

                types: types
                    .map(type => ({
                    
                        id: getIdFromUrl(type.type.url),
                    
                        name: toTitleCase(type.type.name),
                    
                        slot: type.slot
                    
                    }))
                    .sort((a, b) => a.slot - b.slot),

                abilities: abilities
                    .map(ability => ({
                    
                        id: getIdFromUrl(ability.ability.url),
                    
                        name: toTitleCase(ability.ability.name),
                    
                        hidden: ability.is_hidden,
                    
                        slot: ability.slot
                    
                    }))
                    .sort((a, b) => a.slot - b.slot),
                
                stats: {
                
                    hp: stats[0].base_stat,
                
                    attack: stats[1].base_stat,
                
                    defense: stats[2].base_stat,
                
                    specialAttack: stats[3].base_stat,
                
                    specialDefense: stats[4].base_stat,
                
                    speed: stats[5].base_stat
                
                }

            });

        }
        pokemonList.sort((a, b) => a.id - b.id);

        saveJSON(
            OUTPUT_FILE,
            pokemonList
        );

        console.log(
            `Successfully downloaded ${pokemonList.length} Pokémon.`
        );
    } catch (error) {

        console.error("Error downloading Pokémon:");

        console.error(error.message);

    }

}

downloadPokemon();