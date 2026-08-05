const axios = require("axios");

const POKEMON_ID = 25; // Change this when needed

async function inspectLearnset() {

    const { data: pokemon } = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${POKEMON_ID}`
    );

    console.log("================================");
    console.log(`Pokémon: ${pokemon.name}`);
    console.log("================================");

    console.log("\nTotal Moves:");
    console.log(pokemon.moves.length);

    console.log("\n================================");
    console.log("First 5 Learnset Entries");
    console.log("================================");

    console.log(
        JSON.stringify(
            pokemon.moves.slice(0, 5),
            null,
            4
        )
    );

}

inspectLearnset();