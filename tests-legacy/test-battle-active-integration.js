/**
 * Pokémon Companion
 * Battle Active Integration Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



const battleActive =
    app.get(
        "battleActiveFlow"
    );


const battleEngine =
    app.get(
        "battleEngine"
    );



console.log(
    "Battle Active:",
    !!battleActive
);


console.log(
    "Battle Engine:",
    !!battleEngine
);




//--------------------------------
// Send Player Pokemon
//--------------------------------

const player =
    battleActive
        .sendOut({

            species:
                "CHARMANDER",

            level:
                10

        });



console.log(
    "Player Send:",
    player.success
);





//--------------------------------
// Check Active Pokemon
//--------------------------------

const current =
    battleActive
        .getActive();



console.log(
    "Pokemon:",
    current.species
);


console.log(
    "Level:",
    current.level
);


console.log(
    "HP:",
    current.hp
);




//--------------------------------
// Damage Test
//--------------------------------

const damage =
    battleActive
        .active
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
// Status
//--------------------------------

const status =
    battleActive
        .getStatus();



console.log(
    "Has Active:",
    status.hasActive
);