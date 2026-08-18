/**
 * Pokémon Companion
 * Encounter Battle Flow Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");


const container =
    new AppContainer();





const encounterFlow =
    container.get(
        "encounterFlow"
    );


const encounterBattleFlow =
    container.get(
        "encounterBattleFlow"
    );





console.log(
    "Encounter Flow:",
    Boolean(encounterFlow)
);



console.log(
    "Encounter Battle Flow:",
    Boolean(encounterBattleFlow)
);








// Generate wild encounter

const encounter =
    encounterFlow.generateEncounter(
        "MAP_ROUTE1"
    );



console.log(
    "Encounter Created:",
    encounter.success
);







if(
    encounter.success
)
{


    console.log(
        "Pokemon:",
        encounter.encounter.species
    );


}








// Start battle

const battle =
    encounterBattleFlow.startBattle(

        {

            name:
                "Ash"

        },


        {

            species:
                "CHARMANDER",

            level:
                5

        }

    );





console.log(
    "Battle Started:",
    battle.success
);



if(
    battle.success
)
{

    console.log(
        "Wild Pokemon:",
        battle.encounter.species
    );


}
else
{

    console.log(
        "Reason:",
        battle.reason
    );

}