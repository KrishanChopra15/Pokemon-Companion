"use strict";


const WeatherService =
    require("../scripts/services/weather-service");





console.log();


console.log(
"==============================="
);

console.log(
"Weather Service Test"
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
// Test Battle
//================================


const battle =
{

    player:
    {

        party:
        [

            {
                species:"Charizard",

                hp:200,

                maxHP:200,

                type:[
                    "FIRE",
                    "FLYING"
                ],

                ability:null

            }

        ],


        active:0

    },


    opponent:
    {

        party:
        [

            {
                species:"Swampert",

                hp:200,

                maxHP:200,

                type:[
                    "WATER",
                    "GROUND"
                ],

                ability:null

            }

        ],


        active:0

    },


    weather:null


};









//================================
// Rain
//================================


console.log();

console.log(
"Set Rain:"
);


console.log(

    weather.setWeather(

        battle,

        "RAIN",

        "MOVE_RAIN_DANCE"

    )

);



console.log();


console.log(
"Current Weather:"
);



console.log(

    weather.getWeather(
        battle
    )

);









//================================
// Weather Multiplier
//================================


console.log();


console.log(
"Fire Move in Rain:"
);



console.log(

    weather.getMoveMultiplier(

        weather.getWeather(
            battle
        ),

        "FIRE"

    )

);





console.log();


console.log(
"Water Move in Rain:"
);



console.log(

    weather.getMoveMultiplier(

        weather.getWeather(
            battle
        ),

        "WATER"

    )

);









//================================
// Sun
//================================


console.log();

console.log(
"Set Sun:"
);


console.log(

    weather.setWeather(

        battle,

        "SUN",

        "ABILITY_DROUGHT"

    )

);









//================================
// Sandstorm Damage
//================================


console.log();

console.log(
"Set Sandstorm:"
);


weather.setWeather(

    battle,

    "SANDSTORM",

    "MOVE_SANDSTORM"

);




console.log();


console.log(
"Swampert HP Before:"
);



console.log(

    battle.opponent.party[0].hp

);





console.log();


console.log(
"Process Sandstorm:"
);



console.log(

    weather.processTurn(
        battle
    )

);





console.log();


console.log(
"Swampert HP After:"
);



console.log(

    battle.opponent.party[0].hp

);









//================================
// Hail
//================================


console.log();

console.log(
"Set Hail:"
);



weather.setWeather(

    battle,

    "HAIL",

    "MOVE_HAIL"

);





console.log();


console.log(
"Process Hail:"
);



console.log(

    weather.processTurn(
        battle
    )

);









//================================
// Air Lock
//================================


console.log();


console.log(
"Air Lock Test:"
);



battle.weather =
{

    type:"RAIN",

    turns:5,

    source:"MOVE"

};



battle.opponent.party[0].ability =
    "AIR_LOCK";





console.log();


console.log(
"Actual Weather:"
);



console.log(

    weather.getWeather(
        battle
    )

);





console.log();


console.log(
"Effective Weather:"
);



console.log(

    weather.getEffectiveWeather(
        battle
    )

);









//================================
// Completed
//================================


console.log();


console.log(
"Completed."
);