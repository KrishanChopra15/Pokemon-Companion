/**
 * Pokémon Companion
 * Battle Prediction Service Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



console.log(
    "================================"
);

console.log(
    "Battle Prediction Service Test"
);

console.log(
    "================================"
);



const app =
    new AppContainer();



const battlePrediction =
    app.get(
        "battlePrediction"
    );



console.log(
    "Service Loaded:",
    !!battlePrediction
);



if(
    !battlePrediction
)
{

    throw new Error(
        "Battle Prediction Service not registered"
    );

}





const player =
{

    pokemon:

    [

        {

            species:
                "CHARMANDER",

            level:
                10,


            moves:

            [

                {

                    name:
                        "EMBER",

                    type:
                        "FIRE",

                    category:
                        "SPECIAL",

                    power:
                        40

                }

            ]

        }

    ]

};





const result =

    battlePrediction.predictTrainerBattle(

        "TRAINER_LEADER_BROCK",

        player,

        "EXACT",

        10

    );





console.log(
    "\nPrediction Result:"
);


console.log(
    result
);



console.log(
    "\n================================"
);

console.log(
    "Battle Prediction Test Completed"
);

console.log(
    "================================"
);