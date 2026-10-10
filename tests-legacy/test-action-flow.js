/**
 * Pokémon Companion
 * Action Flow Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const container =
    new AppContainer();





const actionManager =
    container.get(
        "actionManager"
    );


const actionFlow =
    container.get(
        "actionFlow"
    );





console.log(
    "Action Manager:",
    Boolean(actionManager)
);



console.log(
    "Action Flow:",
    Boolean(actionFlow)
);








//--------------------------------
// Capture Action
//--------------------------------


const capture =
    actionFlow.capturePokemon(

        "RATTATA",

        3,

        "MAP_ROUTE1"

    );



console.log(
    "Capture Action:",
    capture.success
);



console.log(
    "Pokemon:",
    capture.action.species
);








//--------------------------------
// Badge Action
//--------------------------------


const badge =
    actionFlow.earnBadge(

        "BROCK",

        "BOULDER"

    );



console.log(
    "Badge Action:",
    badge.success
);



console.log(
    "Badge:",
    badge.action.badge
);








//--------------------------------
// History
//--------------------------------


console.log(
    "Actions:",
    actionFlow
        .getHistory()
        .length
);