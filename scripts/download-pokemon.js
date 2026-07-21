const axios = require("axios");
const fs = require("fs");
const path = require("path");

const TOTAL_POKEMON = 10;

const OUTPUT_FILE = path.join(
    __dirname,
    "../database/pokemon.json"
);

async function downloadPokemon() {

    const pokemonList = [];

    for (let id = 1; id <= TOTAL_POKEMON; id++) {

        console.log(`Downloading Pokémon #${id}...`);

        const response = await axios.get(
            `https://pokeapi.co/api/v2/pokemon/${id}`
        );

        const pokemon = response.data;

        pokemonList.push({

            id: pokemon.id,

            number: `#${String(pokemon.id).padStart(4, "0")}`,

            name:
                pokemon.name.charAt(0).toUpperCase() +
                pokemon.name.slice(1),

            height: pokemon.height / 10,

            weight: pokemon.weight / 10,

            generation: null,

            artwork: {
            
                official:
                    pokemon.sprites.other["official-artwork"].front_default,
            
                home:
                    pokemon.sprites.other.home.front_default,
            
                dreamWorld:
                    pokemon.sprites.other.dream_world.front_default
            
            },

            sprites: {
            
                front:
                    pokemon.sprites.front_default,
            
                back:
                    pokemon.sprites.back_default,
            
                frontShiny:
                    pokemon.sprites.front_shiny,
            
                backShiny:
                    pokemon.sprites.back_shiny
            
            },

            types: pokemon.types.map(type => ({
            
                name:
                    type.type.name
                        .replace(/\b\w/g, c => c.toUpperCase()),
            
                slot: type.slot
            
            })),

            abilities: pokemon.abilities.map(ability => ({
            
                name:
                    ability.ability.name
                        .replace("-", " ")
                        .replace(/\b\w/g, c => c.toUpperCase()),
            
                hidden: ability.is_hidden,
            
                slot: ability.slot
            
            })),

            stats: {

                hp: pokemon.stats[0].base_stat,

                attack: pokemon.stats[1].base_stat,

                defense: pokemon.stats[2].base_stat,

                specialAttack: pokemon.stats[3].base_stat,

                specialDefense: pokemon.stats[4].base_stat,

                speed: pokemon.stats[5].base_stat

            }

        });

    }

    fs.writeFileSync(

        OUTPUT_FILE,

        JSON.stringify(pokemonList, null, 4)

    );

    console.log("Done!");
}

downloadPokemon();