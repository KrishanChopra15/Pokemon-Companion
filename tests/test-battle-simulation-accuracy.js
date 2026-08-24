/**
 * Pokémon Companion
 * Battle Simulation Accuracy Test
 *
 * Tests:
 * - Move accuracy
 * - Missed attacks
 * - Damage only when hit
 */

"use strict";



const AppContainer =
    require("../scripts/app-container");





console.log(
    "================================"
);

console.log(
    "Battle Simulation Accuracy Test"
);

console.log(
    "================================"
);





const app =
    new AppContainer(
        "firered"
    );





const battleSimulation =

    app.get(
        "battleSimulation"
    );





console.log(
    "Service Loaded:",
    !!battleSimulation
);









const CHARMANDER =
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
                50

        }

    ]

};









const BULBASAUR =
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
    CHARMANDER
);





console.log(
    "\nBULBASAUR:"
);

console.log(
    BULBASAUR
);









console.log(
    "\nTesting Ember accuracy:"
);


console.log(

{

    move:
        "EMBER",

    accuracy:
        50

}

);









console.log(
    "\nRunning accuracy simulation..."
);





let hits = 0;

let misses = 0;

let totalDamage = 0;





for(
    let i = 0;
    i < 20;
    i++
)
{


    const damage =

        battleSimulation.calculateSimulationDamage(

            CHARMANDER,

            BULBASAUR,

            CHARMANDER.moves[0]

        );



    if(
        damage === 0
    )
    {

        misses++;

    }
    else
    {

        hits++;

        totalDamage += damage;

    }


}









console.log(
    "\nRESULT:"
);


console.log(

{

    hits,

    misses,

    averageDamage:

        hits > 0

        ?

        Math.floor(
            totalDamage / hits
        )

        :

        0

}

);









console.log(
    "================================"
);

console.log(
    "Battle Simulation Accuracy Test Completed"
);

console.log(
    "================================"
);