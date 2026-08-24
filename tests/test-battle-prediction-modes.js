/**
 * Pokémon Companion
 * Battle Prediction Modes Test
 *
 * Tests:
 * - EXACT
 * - RANDOM
 * - BEST_CASE
 * - WORST_CASE
 */

"use strict";



const AppContainer =
    require("../scripts/app-container");





console.log(
    "================================"
);

console.log(
    "Battle Prediction Modes Test"
);

console.log(
    "================================"
);





const app =
    new AppContainer(
        "firered"
    );





const prediction =
    app.get(
        "battlePrediction"
    );





console.log(
    "Service Loaded:",
    !!prediction
);






const playerState =
{

    team:
    [

        {

            species:
                "CHARMANDER",

            level:
                10

        }

    ]

};








const modes =

[

    "EXACT",

    "RANDOM",

    "BEST_CASE",

    "WORST_CASE"

];








for(
    const mode of modes
)
{


    console.log(
        "\n--------------------------------"
    );


    console.log(
        "MODE:",
        mode
    );


    console.log(
        "--------------------------------"
    );





    const result =

        prediction.predictTrainerBattle(

            "TRAINER_LEADER_BROCK",

            playerState,

            mode,

            10

        );





    console.log(

        JSON.stringify(

            result,

            null,

            2

        )

    );


}






console.log(
    "\n================================"
);

console.log(
    "Battle Prediction Modes Test Completed"
);

console.log(
    "================================"
);