const axios = require("axios");

const MOVE_ID = 86; // Change this when needed

async function inspectMove() {

    const { data: move } = await axios.get(
        `https://pokeapi.co/api/v2/move/${MOVE_ID}`
    );

    console.log("================================");
    console.log("Move:", move.name);
    console.log("================================");

    console.log("\nCurrent Values:");
    console.log({
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
        effectChance: move.effect_chance,
        type: move.type?.name
    });

    console.log("\nPast Values:");
    console.log(
        JSON.stringify(
            move.past_values,
            null,
            4
        )
    );
    console.log(
        JSON.stringify(
            move.effect_entries,
            null,
            4
        )
    );
    
    console.log(
        JSON.stringify(
            move.flavor_text_entries,
            null,
            4
        )
    );
}

inspectMove();