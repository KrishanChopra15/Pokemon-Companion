/**
 * Pokémon Companion
 * Level Up Service Test
 *
 * Tests:
 * - Level increase
 * - Stat growth
 * - HP updates
 * - Move learning
 * - Duplicate moves
 * - Level up summary
 */

"use strict";



const LevelUpService =
    require("../scripts/services/level-up-service");









//--------------------------------
// Service
//--------------------------------


const levelUpService =
    new LevelUpService();









//--------------------------------
// Mock Pokemon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",


    level:
        10,


    hp:
        30,


    maxHP:
        30,


    moves:
    [

        "SCRATCH"

    ],


    stats:
    {

        hp:
            30,


        attack:
            20,


        defense:
            18,


        spAttack:
            22,


        spDefense:
            20,


        speed:
            25

    }

};









console.log();

console.log(
    "================================"
);

console.log(
    "Level Up Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Initial Pokemon
//--------------------------------


console.log();

console.log(
    "Initial Pokemon:"
);


console.log(

    charmander

);









//--------------------------------
// Level up
//--------------------------------


console.log();

console.log(
    "Leveling up:"
);


const result =
    levelUpService.levelUp(

        charmander,

        3

    );


console.log(

    result

);









//--------------------------------
// After level
//--------------------------------


console.log();

console.log(
    "Pokemon after level up:"
);


console.log(

    charmander

);









//--------------------------------
// Learn move
//--------------------------------


console.log();

console.log(
    "Learning Ember:"
);


console.log(

    levelUpService.learnMove(

        charmander,

        "EMBER"

    )

);









console.log();

console.log(
    "Moves after learning:"
);


console.log(

    charmander.moves

);









//--------------------------------
// Duplicate move
//--------------------------------


console.log();

console.log(
    "Learning Ember again:"
);


console.log(

    levelUpService.learnMove(

        charmander,

        "EMBER"

    )

);









//--------------------------------
// Process move list
//--------------------------------


console.log();

console.log(
    "Processing level moves:"
);


console.log(

    levelUpService.processMoves(

        charmander,

        [

            {

                level:
                    10,

                name:
                    "GROWL"

            },


            {

                level:
                    13,

                name:
                    "EMBER"

            },


            {

                level:
                    20,

                name:
                    "SMOKESCREEN"

            }

        ]

    )

);









console.log();

console.log(
    "Moves after processing:"
);


console.log(

    charmander.moves

);









//--------------------------------
// Summary
//--------------------------------


console.log();

console.log(
    "Level up summary:"
);


console.log(

    levelUpService.createSummary(

        charmander,

        10

    )

);









console.log();

console.log(
    "Level Up Service Tests Completed."
);

console.log();