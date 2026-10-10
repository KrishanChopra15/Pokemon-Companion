/**
 * Pokémon Companion
 * FireRed Availability Rules Test
 *
 * Tests:
 * - Gym progression order
 * - Recommended levels
 * - Champion progression
 * - Post game requirements
 */

"use strict";



const availabilityRules =
    require("../scripts/rules/firered-availability-rules");









console.log();

console.log(
    "================================"
);

console.log(
    "FireRed Availability Rules Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Brock
//--------------------------------


console.log();

console.log(
    "Brock:"
);


console.log(

    availabilityRules.BROCK

);









//--------------------------------
// Misty
//--------------------------------


console.log();

console.log(
    "Misty:"
);


console.log(

    availabilityRules.MISTY

);









//--------------------------------
// All gyms
//--------------------------------


console.log();

console.log(
    "Gym progression:"
);


const gyms =
[

    availabilityRules.BROCK,

    availabilityRules.MISTY,

    availabilityRules.LT_SURGE,

    availabilityRules.ERIKA,

    availabilityRules.KOGA,

    availabilityRules.SABRINA,

    availabilityRules.BLAINE,

    availabilityRules.GIOVANNI

];



console.log(

    gyms.map(

        gym =>

        ({

            id:
                gym.id,


            order:
                gym.order,


            level:
                gym.recommendedLevel

        })

    )

);









//--------------------------------
// Elite Four
//--------------------------------


console.log();

console.log(
    "Elite Four:"
);


console.log(

    availabilityRules.ELITE_FOUR

);









//--------------------------------
// Champion
//--------------------------------


console.log();

console.log(
    "Champion:"
);


console.log(

    availabilityRules.CHAMPION

);









//--------------------------------
// Post game
//--------------------------------


console.log();

console.log(
    "Post Game:"
);


console.log(

    availabilityRules.POST_GAME

);









//--------------------------------
// Validation
//--------------------------------


console.log();

console.log(
    "Validation:"
);


console.log(

    "Brock order:",

    availabilityRules.BROCK.order === 1

);


console.log(

    "Champion order:",

    availabilityRules.CHAMPION.order === 10

);


console.log(

    "Post game requires Champion:",

    availabilityRules.POST_GAME
        .requirements
        .championDefeated === true

);









console.log();

console.log(
    "FireRed Availability Rules Tests Completed."
);

console.log();