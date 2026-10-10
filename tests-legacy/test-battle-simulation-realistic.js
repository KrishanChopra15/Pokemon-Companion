/**
 * Pokémon Companion
 * Realistic Battle Simulation Test
 *
 * Tests:
 * - Charmander vs Brock Onix
 * - Real move selection
 * - Type effectiveness
 * - STAB
 * - Damage calculation
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const container =
    new AppContainer("firered");



const simulation =
    container.get(
        "battleSimulation"
    );



console.log(
    "================================"
);

console.log(
    "Realistic Battle Simulation Test"
);

console.log(
    "================================"
);





const charmander =
{

    species:"CHARMANDER",

    level:12,


    hp:35,


    attack:20,


    defense:18,


    spAttack:24,


    spDefense:20,


    speed:25,


    types:
    [
        "FIRE"
    ],



    moves:
    [

        {
            name:"EMBER",
        
            type:"FIRE",
        
            power:40,
        
            category:"SPECIAL",
        
            status:"BURN",
        
            statusChance:10
        }

    ]

};







const onix =
{

    species:"ONIX",

    level:12,


    hp:40,


    attack:25,


    defense:45,


    spAttack:15,


    spDefense:20,


    speed:20,


    types:
    [
        "ROCK",
        "GROUND"
    ],



    moves:
    [

        {

            name:"ROCK_THROW",

            type:"ROCK",

            category:"PHYSICAL",

            power:50

        }

    ]

};







const battle =

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

            onix

        ]

    }

};







console.log(
    "\nCHARMANDER:"
);

console.log(
    charmander
);



console.log(
    "\nONIX:"
);

console.log(
    onix
);






const result =

    simulation.simulateBattle(
        battle
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
    "Realistic Battle Simulation Test Completed"
);

console.log(
    "================================"
);