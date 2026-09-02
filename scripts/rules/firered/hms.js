/**
 * Pokémon Companion
 * FireRed HM Rules
 */

"use strict";


module.exports =
[

    //--------------------------------
    // Cut
    //--------------------------------

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


    //--------------------------------
    // Flash
    //--------------------------------

    {
        id:
            "FLASH_UNLOCK",

        location:
            "MAP_ROUTE2",

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


    //--------------------------------
    // Fly
    //--------------------------------

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


    //--------------------------------
    // Surf
    //--------------------------------

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


    //--------------------------------
    // Strength
    //--------------------------------

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
    }

];
