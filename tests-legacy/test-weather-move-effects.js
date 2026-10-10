"use strict";


const WeatherService =
    require("../scripts/services/weather-service");





console.log();


console.log(
"==============================="
);

console.log(
"Weather Move Effects Test"
);

console.log(
"==============================="
);







//================================
// Service
//================================


const weather =
    new WeatherService();









//================================
// Weather Objects
//================================


const rain =
{

    type:
        "RAIN",

    turns:
        5,

    source:
        "MOVE_RAIN_DANCE"

};




const sun =
{

    type:
        "SUN",

    turns:
        5,

    source:
        "ABILITY_DROUGHT"

};




const hail =
{

    type:
        "HAIL",

    turns:
        5,

    source:
        "MOVE_HAIL"

};




const sandstorm =
{

    type:
        "SANDSTORM",

    turns:
        5,

    source:
        "MOVE_SANDSTORM"

};









//================================
// Solar Beam
//================================


console.log();

console.log(
"Solar Beam in Rain:"
);


console.log(

    weather.getSolarBeamModifier(

        rain

    )

);





console.log();

console.log(
"Solar Beam in Sun:"
);



console.log(

    weather.getSolarBeamModifier(

        sun

    )

);









//================================
// Thunder
//================================


console.log();

console.log(
"Thunder in Rain:"
);



console.log(

    weather.getThunderAccuracy(

        rain

    )

);






console.log();

console.log(
"Thunder in Sun:"
);



console.log(

    weather.getThunderAccuracy(

        sun

    )

);






console.log();

console.log(
"Thunder Normal:"
);



console.log(

    weather.getThunderAccuracy(

        null

    )

);









//================================
// Weather Ball
//================================


console.log();

console.log(
"Weather Ball Rain:"
);



console.log(

    weather.getWeatherBallData(

        rain

    )

);






console.log();

console.log(
"Weather Ball Sun:"
);



console.log(

    weather.getWeatherBallData(

        sun

    )

);






console.log();

console.log(
"Weather Ball Hail:"
);



console.log(

    weather.getWeatherBallData(

        hail

    )

);






console.log();

console.log(
"Weather Ball Sandstorm:"
);



console.log(

    weather.getWeatherBallData(

        sandstorm

    )

);









//================================
// Completed
//================================


console.log();


console.log(
"Completed."
);