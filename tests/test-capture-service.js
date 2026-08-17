/**
 * Pokémon Companion
 * Capture Service Test
 *
 * Tests:
 * - Capture chance calculation
 * - Poké Ball capture
 * - Great Ball capture
 * - Ultra Ball capture
 * - Master Ball capture
 * - Capture summary
 */

"use strict";



const CaptureService =
    require("../scripts/services/capture-service");









//--------------------------------
// Service
//--------------------------------


const captureService =
    new CaptureService();









//--------------------------------
// Mock Pokemon
//--------------------------------


const pikachu =
{

    species:
        "PIKACHU",


    level:
        15,


    hp:
        20,


    maxHP:
        60,


    catchRate:
        190

};









const mewtwo =
{

    species:
        "MEWTWO",


    level:
        70,


    hp:
        200,


    maxHP:
        200,


    catchRate:
        3

};









console.log();

console.log(
    "================================"
);

console.log(
    "Capture Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Capture chance
//--------------------------------


console.log();

console.log(
    "Pikachu capture chance:"
);


console.log(

    captureService.calculateChance(

        pikachu,

        "POKEBALL"

    )

);









//--------------------------------
// Pokeball
//--------------------------------


console.log();

console.log(
    "Pokeball capture:"
);


console.log(

    captureService.attemptCapture(

        pikachu,

        "POKEBALL"

    )

);









//--------------------------------
// Great Ball
//--------------------------------


console.log();

console.log(
    "Great Ball capture:"
);


console.log(

    captureService.attemptCapture(

        pikachu,

        "GREATBALL"

    )

);









//--------------------------------
// Ultra Ball
//--------------------------------


console.log();

console.log(
    "Ultra Ball capture:"
);


console.log(

    captureService.attemptCapture(

        pikachu,

        "ULTRABALL"

    )

);









//--------------------------------
// Master Ball
//--------------------------------


console.log();

console.log(
    "Master Ball capture:"
);


console.log(

    captureService.attemptCapture(

        mewtwo,

        "MASTERBALL"

    )

);









//--------------------------------
// Capture summary
//--------------------------------


console.log();

console.log(
    "Capture summary:"
);


const result =
    captureService.attemptCapture(

        pikachu,

        "ULTRABALL"

    );



console.log(

    captureService.createSummary(

        pikachu,

        result

    )

);









console.log();

console.log(
    "Capture Service Tests Completed."
);

console.log();