/**
 * Pokémon Companion
 * Battle Active Container Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



const battleActiveManager =
    app.get(
        "battleActiveManager"
    );


const battleActiveFlow =
    app.get(
        "battleActiveFlow"
    );



console.log(
    "Battle Active Manager:",
    !!battleActiveManager
);


console.log(
    "Battle Active Flow:",
    !!battleActiveFlow
);




const result =
    battleActiveFlow
        .sendOut({

            species:
                "CHARMANDER",

            level:
                5

        });



console.log(
    "Send Out:",
    result.success
);



console.log(
    "Pokemon:",
    result.pokemon.species
);