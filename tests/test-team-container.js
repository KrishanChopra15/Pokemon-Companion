/**
 * Pokémon Companion
 * Team Container Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");





const container =
    new AppContainer();





const teamManager =
    container.get(
        "teamManager"
    );


const teamFlow =
    container.get(
        "teamFlow"
    );





console.log(
    "Team Manager:",
    Boolean(teamManager)
);



console.log(
    "Team Flow:",
    Boolean(teamFlow)
);









//--------------------------------
// Add through container
//--------------------------------


const result =
    teamFlow.addToTeam({

        species:
            "CHARMANDER",


        level:
            5,


        location:
            "PALLET_TOWN"


    });





console.log(
    "Container Team:",
    result.success
);



console.log(
    "Pokemon:",
    result.pokemon.species
);









//--------------------------------
// Team status
//--------------------------------


console.log(
    "Team Size:",
    teamManager
        .getSize()
);