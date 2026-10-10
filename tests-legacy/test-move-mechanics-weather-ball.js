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
"Weather Ball Move Mechanics Test"
);

console.log(
"==============================="
);









//================================
// Weather Ball Move
//================================


const weatherBall =
{

    constant:
        "MOVE_WEATHER_BALL"

};









//================================
// Weather Tests
//================================


const weathers =
[

    "RAIN",

    "SUN",

    "HAIL",

    "SANDSTORM",

    null

];









for(
    const weather of weathers
)
{


    console.log();


    console.log(
        "Weather Ball " +
        (
            weather
            ||
            "NORMAL"
        )
        +
        ":"
    );



    console.log(

        service.resolveMove(

            weatherBall,

            {

                weather

            }

        )

    );


}









console.log();


console.log(
"Completed."
);