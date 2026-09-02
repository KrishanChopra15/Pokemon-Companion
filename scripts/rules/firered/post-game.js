/**
 * Pokémon Companion
 * FireRed Post-Game Rules
 */

"use strict";


module.exports =
[

    //--------------------------------
    // National Dex
    //--------------------------------

    {
        id:
            "NATIONAL_DEX_ACCESS",

        location:
            "MAP_PALLET_TOWN",

        type:
            "POST_GAME",

        requirement:
        {
            storyFlags:
            [
                "HALL_OF_FAME"
            ],

            caughtPokemon:
                60,

            specialRequirements:
            [
                "ONE_ISLAND_VISITED"
            ]
        },

        unlocks:
        [
            "NATIONAL_DEX"
        ]
    },


    //--------------------------------
    // Hoenn trade access
    //--------------------------------

    {
        id:
            "HOENN_TRADE_ACCESS",

        location:
            "MAP_ONE_ISLAND_CELIO",

        type:
            "POST_GAME",

        requirement:
        {
            storyFlags:
            [
                "NATIONAL_DEX",
                "RUBY_OBTAINED",
                "SAPPHIRE_OBTAINED"
            ]
        },

        unlocks:
        [
            "RUBY_SAPPHIRE_TRADE"
        ]
    }

];