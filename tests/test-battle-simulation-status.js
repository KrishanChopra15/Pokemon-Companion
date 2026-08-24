/**
 * Pokémon Companion
 * Battle Simulation Status Test
 *
 * Tests:
 * - Status application
 * - Burn effect
 * - Status damage modifier
 * - Simulation integration
 */

"use strict";



const AppContainer =
    require("../scripts/app-container");





console.log(
    "================================"
);

console.log(
    "Battle Simulation Status Test"
);

console.log(
    "================================"
);





const container =
    new AppContainer();



const simulation =
    container.get(
        "battleSimulation"
    );





console.log(
    "Service Loaded:",
    !!simulation
);







const charmander =

{

    species:
        "CHARMANDER",


    level:
        12,


    hp:
        35,


    attack:
        20,


    defense:
        18,


    spAttack:
        24,


    spDefense:
        20,


    speed:
        25,


    types:
    [

        "FIRE"

    ],


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
                40,


            accuracy:
                100,


            status:
                "BURN",


            statusChance:
                30

        }

    ]

};







const bulbasaur =

{

    species:
        "BULBASAUR",


    level:
        12,


    hp:
        38,


    attack:
        18,


    defense:
        20,


    spAttack:
        22,


    spDefense:
        25,


    speed:
        18,


    types:
    [

        "GRASS"

    ],


    moves:
    [

        {

            name:
                "TACKLE",

            type:
                "NORMAL",

            category:
                "PHYSICAL",

            power:
                40,


            accuracy:
                100

        }

    ]

};








console.log(
    "\nCHARMANDER:"
);

console.log(
    charmander
);





console.log(
    "\nBULBASAUR:"
);

console.log(
    bulbasaur
);








console.log(
    "\nTesting Ember status:"
);





const move =

    charmander.moves[0];





console.log(

{

    move:
        move.name,


    status:
        move.status,


    chance:
        move.statusChance

}

);









console.log(
    "\nSimulating battle..."
);





const result =

    simulation.simulateBattle(

    {


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

                bulbasaur

            ]

        }


    }

);







console.log(
    "\nRESULT:"
);


console.log(
    result
);








console.log(
    "================================"
);

console.log(
    "Battle Simulation Status Test Completed"
);

console.log(
    "================================"
);