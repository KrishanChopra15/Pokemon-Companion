/**
 * Pokémon Companion
 * Pokémon Explanation Service Test
 *
 * Tests:
 * - Normal availability explanation
 * - Hard grind explanation
 * - Extreme grind explanation
 * - Locked Pokémon explanation
 * - Trade explanation
 */

"use strict";



const PokemonExplanationService =
    require("../scripts/services/pokemon-explanation-service");









//--------------------------------
// Service
//--------------------------------


const explanation =
    new PokemonExplanationService();









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Explanation Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Charmander
//--------------------------------


console.log();

console.log(
    "Charmander:"
);


console.log(

    explanation.explain(

        "CHARMANDER",

        {

            available:true,

            difficulty:"NORMAL",

            warning:null,

            source:"NORMAL"

        }

    )

);









//--------------------------------
// Charmeleon
//--------------------------------


console.log();

console.log(
    "Charmeleon:"
);


console.log(

    explanation.explain(

        "CHARMELEON",

        {

            available:true,

            difficulty:"HARD_GRIND",

            warning:
            "Possible before BROCK. Requires evolution at level 16.",

            source:"NORMAL"

        }

    )

);









//--------------------------------
// Charizard
//--------------------------------


console.log();

console.log(
    "Charizard:"
);


console.log(

    explanation.explain(

        "CHARIZARD",

        {

            available:true,

            difficulty:"EXTREME_GRIND",

            warning:
            "Possible before BROCK, but requires excessive grinding to reach level 36.",

            source:"NORMAL"

        }

    )

);









//--------------------------------
// Mewtwo
//--------------------------------


console.log();

console.log(
    "Mewtwo:"
);


console.log(

    explanation.explain(

        "MEWTWO",

        {

            available:false,

            reason:
            "Requires defeating the Champion and obtaining the National Dex to unlock Cerulean Cave access.",

            missingRequirements:
            [

                "CHAMPION_DEFEATED",

                "NATIONAL_DEX"

            ]

        }

    )

);









//--------------------------------
// Trade Squirtle
//--------------------------------


console.log();

console.log(
    "Squirtle Trade:"
);


console.log(

    explanation.explain(

        "SQUIRTLE",

        {

            available:true,

            difficulty:"TRADE",

            warning:null,

            source:"TRADE"

        }

    )

);









//--------------------------------
// Warning check
//--------------------------------


console.log();

console.log(
    "Warning Check:"
);



const warningExample =

    explanation.explain(

        "CHARIZARD",

        {

            available:true,

            difficulty:"EXTREME_GRIND",

            warning:
            "Possible before BROCK, but requires excessive grinding to reach level 36.",

            source:"NORMAL"

        }

    );



console.log(

    explanation.hasWarning(

        warningExample

    )

);









console.log();

console.log(
    "Pokemon Explanation Service Tests Completed."
);

console.log();