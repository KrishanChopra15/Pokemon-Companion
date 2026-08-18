/**
 * Pokémon Companion
 * Team Manager Test
 */

"use strict";


const TeamManager =
    require("../scripts/team/team-manager");


const TeamFlow =
    require("../scripts/team/team-flow");





const teamManager =
    new TeamManager();



const teamFlow =
    new TeamFlow(
        teamManager
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
// Add Pokemon
//--------------------------------


const add =
    teamFlow.addToTeam({

        species:
            "RATTATA",


        level:
            3,


        location:
            "MAP_ROUTE1"

    });



console.log(
    "Add Pokemon:",
    add.success
);



console.log(
    "Pokemon:",
    add.pokemon.species
);









//--------------------------------
// Team Size
//--------------------------------


console.log(
    "Team Size:",
    teamFlow
        .getTeam()
        .length
);









//--------------------------------
// Add second Pokemon
//--------------------------------


teamFlow.addToTeam({

    species:
        "PIDGEY",


    level:
        4

});









//--------------------------------
// Swap
//--------------------------------


const swap =
    teamFlow.reorderTeam(

        0,

        1

    );



console.log(
    "Swap:",
    swap.success
);









//--------------------------------
// Remove
//--------------------------------


const remove =
    teamFlow.removeFromTeam(
        "RATTATA"
    );



console.log(
    "Remove:",
    remove.success
);