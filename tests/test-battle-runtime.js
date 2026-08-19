/**
 * Pokémon Companion
 * Battle Runtime Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");


const app =
    new AppContainer();



const battleService =
    app.get(
        "battle"
    );


const battleEngine =
    app.get(
        "battleEngine"
    );


const battleState =
    app.get(
        "battleStateFlow"
    );



console.log(
    "Battle Service:",
    !!battleService
);


console.log(
    "Battle Engine:",
    !!battleEngine
);


console.log(
    "Battle State:",
    !!battleState
);





//--------------------------------
// Create battle
//--------------------------------


const battle =
{

    id:
        "TEST_1",


    player:
    {

        party:
        [

            {

                species:
                    "CHARMANDER",


                level:
                    10,


                hp:
                    100,


                moves:
                [

                    {

                        name:
                            "EMBER",


                        power:
                            40,


                        accuracy:
                            100

                    }

                ]

            }

        ]

    },



    opponent:
    {

        party:
        [

            {

                species:
                    "PIDGEY",


                level:
                    5,


                hp:
                    40,


                moves:
                [

                    {

                        name:
                            "GUST",


                        power:
                            40,


                        accuracy:
                            100

                    }

                ]

            }

        ]

    }


};






const initialized =
    battleEngine
        .initializeBattle(
            battle
        );



console.log(
    "Battle Initialized:",
    !!initialized
);





const state =
    battleState
        .getBattleState();



console.log(
    "Player:",
    state.player.species
);


console.log(
    "Enemy:",
    state.enemy.species
);





//--------------------------------
// Execute turn
//--------------------------------


const result =
    battleEngine.processTurn(

        "TEST_1",

        {
            name:
                "EMBER",

            power:
                40,

            accuracy:
                100

        }

    );





console.log(
    "Turn Success:",
    result.success
);


console.log(
    "Actions:",
    result.result.actions.length
);



console.log(
    "Enemy HP:",
    result.result.actions[0].targetHP
);