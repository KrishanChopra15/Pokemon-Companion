/**
 * Pokémon Companion
 * Battle State Container Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



const battleState =
    app.get(
        "battleStateFlow"
    );



console.log(
    "Battle State Flow:",
    !!battleState
);



const result =
    battleState
        .setPlayer({

            species:
                "CHARMANDER"

        });



console.log(
    "Set Player:",
    result.success
);


console.log(
    "Pokemon:",
    result.pokemon.species
);