/**
 * Pokémon Companion
 * Move Learner Test
 */

"use strict";


const db =
require("../database/generated/firered/pokemon-move-learners.json");



function testPokemon(id, moveName)
{

    console.log("\n==============================");
    console.log(id, moveName);
    console.log("==============================\n");


    const result =
    db[id]?.filter(
        entry =>
        entry.move.name === moveName
    );


    console.log(
        JSON.stringify(
            result,
            null,
            4
        )
    );

}



testPokemon(
    "0285",
    "Hydro Pump"
);


testPokemon(
    "0284",
    "Hydro Pump"
);