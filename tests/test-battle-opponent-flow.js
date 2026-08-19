/**
 * Pokémon Companion
 * Battle Opponent Flow Test
 */

"use strict";


const BattleOpponentManager =
    require("../scripts/battle-opponent/battle-opponent-manager");


const BattleOpponentFlow =
    require("../scripts/battle-opponent/battle-opponent-flow");




const manager =
    new BattleOpponentManager();



const flow =
    new BattleOpponentFlow(
        manager
    );



console.log(
    "Battle Opponent Flow:",
    !!flow
);




//--------------------------------
// Send Enemy
//--------------------------------

const send =
    flow
        .sendOut({

            species:
                "RATTATA",

            level:
                5

        });



console.log(
    "Send Enemy:",
    send.success
);



console.log(
    "Enemy:",
    send.pokemon.species
);




//--------------------------------
// Status
//--------------------------------

console.log(
    "Has Opponent:",
    flow
        .getStatus()
        .hasOpponent
);