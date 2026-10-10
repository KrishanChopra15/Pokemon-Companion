/**
 * Pokémon Companion
 * Type Effectiveness Service Test
 *
 * Tests:
 * - Super effective
 * - Double weakness
 * - Resistances
 * - Double resistances
 * - Immunities
 * - Foresight interaction
 */

"use strict";



const TypeEffectivenessService =
    require("../scripts/services/type-effectiveness-service");





const service =
    new TypeEffectivenessService();









console.log();

console.log(
"================================"
);

console.log(
"Type Effectiveness Tests"
);

console.log(
"================================"
);









//--------------------------------
// Fire
//--------------------------------


console.log();

console.log(
"Fire vs Grass:"
);


console.log(

    service.getMultiplier(

        "FIRE",

        [

            "GRASS"

        ]

    )

);









console.log();

console.log(
"Fire vs Grass/Ice:"
);


console.log(

    service.getMultiplier(

        "FIRE",

        [

            "GRASS",

            "ICE"

        ]

    )

);









//--------------------------------
// Ice
//--------------------------------


console.log();

console.log(
"Ice vs Dragon/Flying:"
);


console.log(

    service.getMultiplier(

        "ICE",

        [

            "DRAGON",

            "FLYING"

        ]

    )

);









//--------------------------------
// Double resistance
//--------------------------------


console.log();

console.log(
"Fire vs Water/Rock:"
);


console.log(

    service.getMultiplier(

        "FIRE",

        [

            "WATER",

            "ROCK"

        ]

    )

);









//--------------------------------
// Immunity
//--------------------------------


console.log();

console.log(
"Ground vs Flying:"
);


console.log(

    service.getMultiplier(

        "GROUND",

        [

            "FLYING"

        ]

    )

);









console.log();

console.log(
"Normal vs Ghost:"
);


console.log(

    service.getMultiplier(

        "NORMAL",

        [

            "GHOST"

        ]

    )

);









//--------------------------------
// Foresight
//--------------------------------


console.log();

console.log(
"Normal vs Ghost with Foresight:"
);


console.log(

    service.getMultiplier(

        "NORMAL",

        [

            "GHOST"

        ],

        {

            foresight:
                true

        }

    )

);









//--------------------------------
// More checks
//--------------------------------


console.log();

console.log(
"Electric vs Water:"
);


console.log(

    service.getMultiplier(

        "ELECTRIC",

        [

            "WATER"

        ]

    )

);









console.log();

console.log(
"Rock vs Fire/Flying:"
);


console.log(

    service.getMultiplier(

        "ROCK",

        [

            "FIRE",

            "FLYING"

        ]

    )

);









console.log();

console.log(
"Completed."
);
