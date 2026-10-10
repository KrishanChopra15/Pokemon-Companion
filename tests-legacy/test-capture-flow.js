/**
 * Pokémon Companion
 * Capture Flow Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");





const container =
    new AppContainer();





const captureFlow =
    container.get(
        "captureFlow"
    );





const tracker =
    container.get(
        "pokemonTracker"
    );





const actionFlow =
    container.get(
        "actionFlow"
    );









console.log(
    "Capture Flow:",
    Boolean(captureFlow)
);









//--------------------------------
// Confirm capture
//--------------------------------


const result =
    captureFlow.confirmCapture({

        species:
            "RATTATA",


        level:
            3,


        location:
            "MAP_ROUTE1"


    });





console.log(
    "Capture:",
    result.success
);





console.log(
    "Pokemon:",
    result.pokemon.species
);









//--------------------------------
// Tracker check
//--------------------------------


console.log(
    "Tracked:",
    tracker
        .getAll()
        .length
);









//--------------------------------
// Action check
//--------------------------------


console.log(
    "Actions:",
    actionFlow
        .getHistory()
        .length
);