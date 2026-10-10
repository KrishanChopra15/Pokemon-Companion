/**
 * Pokémon Companion
 * Battle Opponent Container Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



const opponentFlow =
    app.get(
        "battleOpponentFlow"
    );



const opponentManager =
    app.get(
        "battleOpponentManager"
    );





console.log(
    "Opponent Manager:",
    !!opponentManager
);


console.log(
    "Opponent Flow:",
    !!opponentFlow
);




//--------------------------------
// Send Enemy
//--------------------------------

const enemy =
    opponentFlow
        .sendOut({

            species:
                "PIDGEY",

            level:
                5

        });



console.log(
    "Send Enemy:",
    enemy.success
);



console.log(
    "Pokemon:",
    enemy.pokemon.species
);



console.log(
    "Level:",
    enemy.pokemon.level
);




//--------------------------------
// Status
//--------------------------------

const status =
    opponentFlow
        .getStatus();



console.log(
    "Has Opponent:",
    status.hasOpponent
);