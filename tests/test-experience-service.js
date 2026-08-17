/**
 * Pokémon Companion
 * Experience Service Test
 *
 * Tests:
 * - EXP calculation
 * - EXP rewards
 * - Growth rate integration
 * - Giving EXP
 * - Level up
 * - Multiple level gains
 * - EXP progress
 */

"use strict";



const ExperienceService =
    require("../scripts/services/experience-service");


const GrowthRateService =
    require("../scripts/services/growth-rate-service");









//--------------------------------
// Services
//--------------------------------


const growthRates =
    new GrowthRateService();



const experienceService =
    new ExperienceService(

        growthRates

    );









//--------------------------------
// Mock Pokemon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",


    level:
        10,


    exp:
        1000,


    baseExp:
        62,


    growthRate:
        "GROWTH_MEDIUM_SLOW"

};









const geodude =
{

    species:
        "GEODUDE",


    level:
        12,


    baseExp:
        60,


    growthRate:
        "GROWTH_MEDIUM_FAST"

};









console.log();

console.log(
    "================================"
);

console.log(
    "Experience Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Growth rate check
//--------------------------------


console.log();

console.log(
    "Charmander growth rate:"
);


console.log(

    charmander.growthRate

);









console.log();

console.log(
    "EXP required for level 11:"
);


console.log(

    experienceService.getExpRequired(

        11,

        charmander.growthRate

    )

);









//--------------------------------
// Calculate EXP
//--------------------------------


console.log();

console.log(
    "EXP from Geodude:"
);


const exp =
    experienceService.calculateExp(

        geodude,

        "TRAINER"

    );


console.log(
    exp
);









//--------------------------------
// Reward summary
//--------------------------------


console.log();

console.log(
    "Reward summary:"
);


console.log(

    experienceService.createReward(

        geodude,

        "TRAINER"

    )

);









//--------------------------------
// Give EXP
//--------------------------------


console.log();

console.log(
    "Giving EXP:"
);


console.log(

    experienceService.giveExp(

        charmander,

        400

    )

);









//--------------------------------
// Pokemon after EXP
//--------------------------------


console.log();

console.log(
    "Charmander after EXP:"
);


console.log(

    charmander

);









//--------------------------------
// EXP progress
//--------------------------------


console.log();

console.log(
    "EXP progress:"
);


console.log(

    experienceService.getExpProgress(

        charmander

    )

);









//--------------------------------
// Large EXP gain
//--------------------------------


console.log();

console.log(
    "Giving large EXP:"
);


console.log(

    experienceService.giveExp(

        charmander,

        5000

    )

);









console.log();

console.log(
    "Charmander after large EXP:"
);


console.log(

    charmander

);









//--------------------------------
// Final progress
//--------------------------------


console.log();

console.log(
    "Final EXP progress:"
);


console.log(

    experienceService.getExpProgress(

        charmander

    )

);









console.log();

console.log(
    "Experience Service Tests Completed."
);

console.log();