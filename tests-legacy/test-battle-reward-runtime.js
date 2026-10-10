/**
 * Pokémon Companion
 * Battle Reward Runtime Test
 *
 * Tests:
 * - Battle creation
 * - Battle completion
 * - EXP reward
 * - Level progression
 * - Evolution processing
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");





//--------------------------------
// App
//--------------------------------

const app =
    new AppContainer();





const battleService =
    app.get(
        "battle"
    );


const progression =
    app.get(
        "pokemonProgression"
    );


const experience =
    app.get(
        "experience"
    );





console.log();

console.log(
    "================================"
);

console.log(
    "Battle Reward Runtime Test"
);

console.log(
    "================================"
);







//--------------------------------
// Mock Player Pokemon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",


    level:
        15,


    exp:
        4050,


    hp:
        45,


    maxHP:
        45,


    growthRate:
        "GROWTH_MEDIUM_SLOW",


    moves:
    [

        {
            name:
                "EMBER"
        }

    ]

};









//--------------------------------
// Mock Enemy
//--------------------------------


const pidgey =
{

    species:
        "PIDGEY",


    level:
        10,


    hp:
        0,


    baseExp:
        50


};









//--------------------------------
// Create battle manually
//--------------------------------


const battleId =
    "REWARD_TEST_1";



battleService.activeBattles[battleId] =
{

    id:
        battleId,


    type:
        "WILD",


    status:
        "ACTIVE",


    player:
    {

        party:
        [

            charmander

        ]

    },


    opponent:
    {

        party:
        [

            pidgey

        ]

    },


    result:
        null


};







console.log();

console.log(
    "Before Battle:"
);


console.log(
    charmander
);









//--------------------------------
// Give victory reward
//--------------------------------


const result =
    battleService.winBattle(

        battleId

    );





console.log();

console.log(
    "Battle Result:"
);


console.log(
    result
);









//--------------------------------
// After progression
//--------------------------------


console.log();

console.log(
    "After Battle:"
);


console.log(
    charmander
);









console.log();

console.log(
    "Progression Summary:"
);


console.log(

    progression.getSummary(

        charmander

    )

);









console.log();

console.log(
    "Battle Reward Runtime Completed."
);

console.log();