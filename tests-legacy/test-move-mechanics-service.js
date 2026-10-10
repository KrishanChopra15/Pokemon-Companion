"use strict";


const MoveMechanicsService =
    require("../scripts/services/move-mechanics-service");





const service =
    new MoveMechanicsService(
        "firered"
    );







console.log();


console.log(
"==============================="
);

console.log(
"Move Mechanics Service Test"
);

console.log(
"==============================="
);









//================================
// Nature Power Tests
//================================


const naturePower =
{

    constant:
        "MOVE_NATURE_POWER"

};








const environments =
[

    "BUILDING",

    "PLAIN",

    "LINK_BATTLE",

    "TALL_GRASS",

    "LONG_GRASS",

    "SAND",

    "ASH",

    "CAVE",

    "ROCK",

    "POND",

    "SEA",

    "UNDERWATER"

];






for(
    const environment of environments
)
{


    console.log();


    console.log(
        "Nature Power " + environment + ":"
    );



    console.log(

        service.resolveMove(

            naturePower,

            {

                environment

            }

        )

    );


}









//================================
// Normal Move Test
//================================


console.log();


console.log(
"Normal Move:"
);



console.log(

    service.resolveMove(

        {

            constant:
                "MOVE_FLAMETHROWER"

        },

        {

            environment:
                "CAVE"

        }

    )

);









//================================
// Unknown Environment
//================================


console.log();


console.log(
"Nature Power Unknown Environment:"
);



console.log(

    service.resolveMove(

        naturePower,

        {

            environment:
                "UNKNOWN"

        }

    )

);









console.log();


console.log(
"Completed."
);