/**
 * Pokémon Companion
 * Battle Validation Service Test
 *
 * Tests:
 * - Valid moves
 * - Unknown moves
 * - Invalid Pokémon
 * - Zero PP
 * - Struggle activation
 * - Manual Struggle rules
 */

"use strict";





const BattleValidationService =
    require("../scripts/services/battle-validation-service");









console.log();

console.log(
"================================"
);

console.log(
"Battle Validation Service Tests"
);

console.log(
"================================"
);









const validation =
    new BattleValidationService();









//--------------------------------
// Mock moves
//--------------------------------


const ember =
{

    name:
        "EMBER",


    constant:
        "MOVE_EMBER",


    pp:
        25,


    maxPP:
        25

};





const tackle =
{

    name:
        "TACKLE",


    constant:
        "MOVE_TACKLE",


    pp:
        35,


    maxPP:
        35

};









//--------------------------------
// Mock Pokémon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",


    moves:
    [

        {
            ...ember
        },


        {
            ...tackle
        }

    ]

};









//--------------------------------
// Valid move
//--------------------------------


console.log();

console.log(
"Valid move:"
);



console.log(

    validation.validateMove(

        charmander,

        {

            name:
                "EMBER",


            constant:
                "MOVE_EMBER"

        }

    )

);









//--------------------------------
// Unknown move
//--------------------------------


console.log();

console.log(
"Unknown move:"
);



console.log(

    validation.validateMove(

        charmander,

        {

            name:
                "FLY",


            constant:
                "MOVE_FLY"

        }

    )

);









//--------------------------------
// Invalid Pokémon
//--------------------------------


console.log();

console.log(
"Invalid Pokémon:"
);



console.log(

    validation.validateMove(

        null,

        ember

    )

);









//--------------------------------
// Zero PP
//--------------------------------


console.log();

console.log(
"Zero PP:"
);



const noPPPokemon =
{

    species:
        "CHARMANDER",


    moves:
    [

        {

            ...ember,


            pp:
                0

        }

    ]

};









console.log(

    validation.validateMove(

        noPPPokemon,

        {

            name:
                "EMBER",


            constant:
                "MOVE_EMBER"

        }

    )

);









//--------------------------------
// No moves = STRUGGLE
//--------------------------------


console.log();

console.log(
"No moves Struggle:"
);



const noMovePokemon =
{

    species:
        "DITTO",


    moves:
        []

};









console.log(

    validation.validateMove(

        noMovePokemon,

        null

    )

);









//--------------------------------
// Manual Struggle allowed
//--------------------------------


console.log();

console.log(
"Manual Struggle allowed:"
);



console.log(

    validation.validateMove(

        noMovePokemon,

        {

            name:
                "STRUGGLE",


            constant:
                "MOVE_STRUGGLE"

        }

    )

);









//--------------------------------
// Manual Struggle rejected
//--------------------------------


console.log();

console.log(
"Manual Struggle rejected:"
);



console.log(

    validation.validateMove(

        charmander,

        {

            name:
                "STRUGGLE",


            constant:
                "MOVE_STRUGGLE"

        }

    )

);









//--------------------------------
// Usable moves
//--------------------------------


console.log();

console.log(
"Usable moves:"
);



console.log(

    validation.getUsableMoves(

        charmander

    )
    .map(

        move =>

            move.name

    )

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Validation Service Tests Completed."
);

console.log(
"================================"
);