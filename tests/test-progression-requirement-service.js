/**
 * Pokémon Companion
 * Progression Requirement Service Test
 *
 * Tests:
 * - Badge requirements
 * - Story flag requirements
 * - Item requirements
 * - Location requirements
 * - Champion requirement
 * - National Dex requirement
 */

"use strict";



const ProgressionRequirementService =
    require("../scripts/services/progression-requirement-service");









//--------------------------------
// Service
//--------------------------------


const progressionService =
    new ProgressionRequirementService();









//--------------------------------
// Player states
//--------------------------------


const newPlayer =
{

    badges:[],


    storyFlags:[],


    items:{},


    locations:[],


    championDefeated:false,


    nationalDex:false

};









const midGamePlayer =
{

    badges:
    [

        "BOULDER_BADGE",

        "CASCADE_BADGE"

    ],


    storyFlags:
    [

        "SILPH_CO_COMPLETED"

    ],


    items:
    {

        "POKE_FLUTE":1

    },


    locations:
    [

        "CERULEAN_CITY",

        "SAFFRON_CITY"

    ],


    championDefeated:false,


    nationalDex:false

};









const postGamePlayer =
{

    badges:
    [

        "BOULDER_BADGE",

        "CASCADE_BADGE",

        "THUNDER_BADGE",

        "RAINBOW_BADGE",

        "SOUL_BADGE",

        "MARSH_BADGE",

        "VOLCANO_BADGE",

        "EARTH_BADGE"

    ],


    storyFlags:
    [

        "SILPH_CO_COMPLETED",

        "ELITE_FOUR_COMPLETED"

    ],


    items:
    {

        "POKE_FLUTE":1

    },


    locations:
    [

        "CERULEAN_CITY",

        "CERULEAN_CAVE"

    ],


    championDefeated:true,


    nationalDex:true

};









console.log();

console.log(
    "================================"
);

console.log(
    "Progression Requirement Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Brock badge requirement
//--------------------------------


console.log();

console.log(
    "Brock requirement:"
);


console.log(

    progressionService.check(

        {

            badges:
            [

                "BOULDER_BADGE"

            ]

        },

        newPlayer

    )

);









console.log();

console.log(
    "Brock after badge:"
);


console.log(

    progressionService.check(

        {

            badges:
            [

                "BOULDER_BADGE"

            ]

        },

        midGamePlayer

    )

);









//--------------------------------
// Story flag
//--------------------------------


console.log();

console.log(
    "Silph Co requirement:"
);


console.log(

    progressionService.check(

        {

            storyFlags:
            [

                "SILPH_CO_COMPLETED"

            ]

        },

        newPlayer

    )

);









console.log();

console.log(
    "Silph Co completed:"
);


console.log(

    progressionService.check(

        {

            storyFlags:
            [

                "SILPH_CO_COMPLETED"

            ]

        },

        midGamePlayer

    )

);









//--------------------------------
// Item requirement
//--------------------------------


console.log();

console.log(
    "Poke Flute requirement:"
);


console.log(

    progressionService.check(

        {

            items:
            [

                "POKE_FLUTE"

            ]

        },

        midGamePlayer

    )

);









//--------------------------------
// Cerulean Cave
//--------------------------------


console.log();

console.log(
    "Mewtwo before Champion:"
);


console.log(

    progressionService.check(

        {

            locations:
            [

                "CERULEAN_CAVE"

            ],


            championDefeated:true,


            nationalDex:true

        },

        midGamePlayer

    )

);









console.log();

console.log(
    "Mewtwo post game:"
);


console.log(

    progressionService.check(

        {

            locations:
            [

                "CERULEAN_CAVE"

            ],


            championDefeated:true,


            nationalDex:true

        },

        postGamePlayer

    )

);









//--------------------------------
// National Dex
//--------------------------------


console.log();

console.log(
    "National Dex requirement:"
);


console.log(

    progressionService.check(

        {

            nationalDex:true

        },

        midGamePlayer

    )

);









console.log();

console.log(
    "National Dex unlocked:"
);


console.log(

    progressionService.check(

        {

            nationalDex:true

        },

        postGamePlayer

    )

);









//--------------------------------
// Multiple requirements
//--------------------------------


console.log();

console.log(
    "Full Mewtwo requirement:"
);


console.log(

    progressionService.check(

        {

            championDefeated:true,


            nationalDex:true,


            locations:
            [

                "CERULEAN_CAVE"

            ]

        },

        postGamePlayer

    )

);









console.log();

console.log(
    "Progression Requirement Service Tests Completed."
);

console.log();