/**
 * Pokémon Companion
 * FireRed Progression Rules
 *
 * Source progression definitions for Pokémon FireRed.
 *
 * Responsibilities:
 * - Define story progression rules.
 * - Define badge requirements.
 * - Define HM unlock requirements.
 * - Define key item gates.
 *
 * Does NOT:
 * - Generate databases.
 * - Read ROM data.
 * - Track player state.
 */

"use strict";


module.exports = [


    //----------------------------------------
    // Gym progression
    //----------------------------------------


    {
        id:
            "PEWTER_GYM_COMPLETE",

        location:
            "MAP_PEWTER_GYM",

        type:
            "GYM",

        requirement:
        {
            badges:
                []
        },

        unlocks:
        [
            "BOULDER_BADGE",
            "TM34"
        ]

    },



    {
        id:
            "CERULEAN_GYM_COMPLETE",

        location:
            "MAP_CERULEAN_GYM",

        type:
            "GYM",

        requirement:
        {
            badges:
            [
                "BOULDER_BADGE"
            ]
        },

        unlocks:
        [
            "CASCADE_BADGE",
            "TM29"
        ]

    },



    {
        id:
            "VERMILION_GYM_COMPLETE",

        location:
            "MAP_VERMILION_GYM",

        type:
            "GYM",

        requirement:
        {
            badges:
            [
                "BOULDER_BADGE",
                "CASCADE_BADGE"
            ]
        },

        unlocks:
        [
            "THUNDER_BADGE"
        ]

    },




    //----------------------------------------
    // HM unlocks
    //----------------------------------------


    {
        id:
            "CUT_UNLOCK",

        location:
            "MAP_SSANNE",

        type:
            "HM",

        requirement:
        {
            keyItems:
            [
                "HM01"
            ],

            badges:
            [
                "CASCADE_BADGE"
            ]
        },

        unlocks:
        [
            "CAN_USE_CUT"
        ]

    },



    {
        id:
            "FLASH_UNLOCK",

        location:
            "MAP_ROUTE_2",

        type:
            "HM",

        requirement:
        {
            keyItems:
            [
                "HM05"
            ],

            badges:
            [
                "BOULDER_BADGE"
            ]
        },

        unlocks:
        [
            "CAN_USE_FLASH"
        ]

    },



    {
        id:
            "SURF_UNLOCK",

        location:
            "MAP_FUCHSIA_CITY",

        type:
            "HM",

        requirement:
        {
            keyItems:
            [
                "HM03"
            ],

            badges:
            [
                "SOUL_BADGE"
            ]
        },

        unlocks:
        [
            "CAN_USE_SURF"
        ]

    },



    {
        id:
            "STRENGTH_UNLOCK",

        location:
            "MAP_FUCHSIA_CITY",

        type:
            "HM",

        requirement:
        {
            keyItems:
            [
                "HM04"
            ],

            badges:
            [
                "RAINBOW_BADGE"
            ]
        },

        unlocks:
        [
            "CAN_USE_STRENGTH"
        ]

    },



    {
        id:
            "FLY_UNLOCK",

        location:
            "MAP_ROUTE_16",

        type:
            "HM",

        requirement:
        {
            keyItems:
            [
                "HM02"
            ],

            badges:
            [
                "THUNDER_BADGE"
            ]
        },

        unlocks:
        [
            "CAN_USE_FLY"
        ]

    },





    //----------------------------------------
    // Story gates
    //----------------------------------------


    {
        id:
            "SS_ANNE_ACCESS",

        location:
            "MAP_SSANNE_EXTERIOR",

        type:
            "STORY",

        requirement:
        {
            keyItems:
            [
                "SS_TICKET"
            ]
        },

        unlocks:
        [
            "SS_ANNE_AVAILABLE"
        ]

    },



    {
        id:
            "SILPH_CO_ACCESS",

        location:
            "MAP_SAFFRON_CITY",

        type:
            "STORY",

        requirement:
        {
            keyItems:
            [
                "TEA"
            ]
        },

        unlocks:
        [
            "SAFFRON_CITY_ACCESS"
        ]

    },



    {
        id:
            "VICTORY_ROAD_ACCESS",

        location:
            "MAP_VICTORY_ROAD_1F",

        type:
            "STORY",

        requirement:
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
            ]
        },

        unlocks:
        [
            "POKEMON_LEAGUE_ACCESS"
        ]

    }



];