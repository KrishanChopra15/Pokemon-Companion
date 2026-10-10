/**
 * Pokémon Companion
 * Battle Opponent Manager Test
 */

"use strict";


const BattleOpponentManager =
    require("../scripts/battle-opponent/battle-opponent-manager");



const manager =
    new BattleOpponentManager();



console.log(
    "Battle Opponent Manager:",
    !!manager
);




//--------------------------------
// Set Opponent
//--------------------------------

const set =
    manager
        .setOpponent({

            species:
                "PIDGEY",

            level:
                8

        });



console.log(
    "Set Enemy:",
    set.success
);



console.log(
    "Pokemon:",
    set.pokemon.species
);


console.log(
    "HP:",
    set.pokemon.hp
);




//--------------------------------
// Damage
//--------------------------------

const damage =
    manager
        .takeDamage(
            20
        );



console.log(
    "Damage:",
    damage.success
);


console.log(
    "HP After Damage:",
    damage.pokemon.hp
);




//--------------------------------
// Faint
//--------------------------------

manager
    .takeDamage(
        100
    );



console.log(
    "Fainted:",
    manager
        .getOpponent()
        .fainted
);




//--------------------------------
// Clear
//--------------------------------

const clear =
    manager
        .clear();



console.log(
    "Clear:",
    clear.success
);


console.log(
    "Has Opponent:",
    manager
        .getStatus()
        .hasOpponent
);