const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    toTitleCase,
    formatNationalDexNumber
} = require("../utils/formatting");

const {
    getIdFromUrl,
    sortById,
    sortByProperty,
    createReferenceList
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
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/pokemon.json"
);

async function downloadPokemon() {

    try {

        const pokemonList = [];

        const pokemonResources =
            await getResourceList(
                "pokemon"
            );

        for (const pokemonResource of pokemonResources) {

            const id =
                getIdFromUrl(
                    pokemonResource.url
                );

            console.log(
                `Downloading Pokémon #${id}...`
            );

            const pokemon =
                await getResource(
                    "pokemon",
                    id
                );

            const sprites =
                pokemon.sprites;

            const artwork =
                sprites.other;

            const stats =
                pokemon.stats;

            pokemonList.push({

                id:
                    pokemon.id,

                speciesId:
                    getIdFromUrl(
                        pokemon.species.url
                    ),

                order:
                    pokemon.order,

                number:
                    formatNationalDexNumber(
                        pokemon.id
                    ),

                name:
                    toTitleCase(
                        pokemon.name
                    ),

                height:
                    pokemon.height / 10,

                weight:
                    pokemon.weight / 10,

                artwork: {

                    official:
                        artwork[
                            "official-artwork"
                        ].front_default,

                    home:
                        artwork.home.front_default,

                    dreamWorld:
                        artwork.dream_world.front_default

                },

                sprites: {

                    front:
                        sprites.front_default,

                    back:
                        sprites.back_default,

                    frontShiny:
                        sprites.front_shiny,

                    backShiny:
                        sprites.back_shiny

                },

                types:

                    sortByProperty(
                    
                        pokemon.types.map(type => ({
                        
                            ...createNamedApiReference(
                                type.type
                            ),
                        
                            slot:
                                type.slot
                        
                        })),
                    
                        "slot"
                    
                    ),

                abilities:

                    sortByProperty(
                    
                        pokemon.abilities.map(ability => ({
                        
                            ...createNamedApiReference(
                                ability.ability
                            ),
                        
                            hidden:
                                ability.is_hidden,
                        
                            slot:
                                ability.slot
                        
                        })),
                    
                        "slot"
                    
                    ),

                stats: {

                    hp:
                        stats[0].base_stat,

                    attack:
                        stats[1].base_stat,

                    defense:
                        stats[2].base_stat,

                    specialAttack:
                        stats[3].base_stat,

                    specialDefense:
                        stats[4].base_stat,

                    speed:
                        stats[5].base_stat

                }

            });

        }

        sortById(
            pokemonList
        );

        saveJSON(
            OUTPUT_FILE,
            pokemonList
        );

        printSuccess(
            `Downloaded ${pokemonList.length} Pokémon`
        );

        printOutputFile(
            OUTPUT_FILE
        );

    } catch (error) {

        printError(
            error,
            "Error downloading Pokémon"
        );

    }

}

downloadPokemon();