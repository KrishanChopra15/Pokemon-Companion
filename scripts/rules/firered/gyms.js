/**
 * Pokémon Companion
 * FireRed Gym Rules
 */

"use strict";


module.exports =
[

    //--------------------------------
    // Brock
    //--------------------------------

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
            "BOULDER_BADGE"
        ]
    },


    //--------------------------------
    // Misty
    //--------------------------------

    {
        id:
            "CERULEAN_GYM_COMPLETE",

        location:
            "MAP_CERULEAN_CITY_GYM",

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
            "CASCADE_BADGE"
        ]
    },


    //--------------------------------
    // Lt. Surge
    //
    // The gym requires Cut to access.
    //--------------------------------

    {
        id:
            "VERMILION_GYM_COMPLETE",

        location:
            "MAP_VERMILION_CITY_GYM",

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


    //--------------------------------
    // Erika
    //
    // Reaching Celadon does not require
    // defeating Lt. Surge.
    //
    // The gym requires Cut to access.
    //--------------------------------

    {
        id:
            "CELADON_GYM_COMPLETE",

        location:
            "MAP_CELADON_CITY_GYM",

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
            "RAINBOW_BADGE"
        ]
    },


    //--------------------------------
    // Koga
    //
    // Koga can be defeated without
    // the Thunder Badge or Rainbow Badge.
    //--------------------------------

    {
        id:
            "FUCHSIA_GYM_COMPLETE",

        location:
            "MAP_FUCHSIA_CITY_GYM",

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
            "SOUL_BADGE"
        ]
    },


    //--------------------------------
    // Sabrina
    //
    // Silph Co. completion is the real
    // story gate.
    //--------------------------------

    {
        id:
            "SAFFRON_GYM_COMPLETE",

        location:
            "MAP_SAFFRON_CITY_GYM",

        type:
            "GYM",

        requirement:
        {
            storyFlags:
            [
                "SILPH_CO_COMPLETED"
            ]
        },

        unlocks:
        [
            "MARSH_BADGE"
        ]
    },


    //--------------------------------
    // Blaine
    //--------------------------------

    {
        id:
            "CINNABAR_GYM_COMPLETE",

        location:
            "MAP_CINNABAR_ISLAND_GYM",

        type:
            "GYM",

        requirement:
        {
            abilities:
            [
                "CAN_USE_SURF"
            ],

            keyItems:
            [
                "SECRET_KEY"
            ]
        },

        unlocks:
        [
            "VOLCANO_BADGE"
        ]
    },


    //--------------------------------
    // Giovanni
    //--------------------------------

    {
        id:
            "VIRIDIAN_GYM_COMPLETE",

        location:
            "MAP_VIRIDIAN_CITY_GYM",

        type:
            "GYM",

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
                "VOLCANO_BADGE"
            ],

            storyFlags:
            [
                "SILPH_CO_COMPLETED"
            ]
        },

        unlocks:
        [
            "EARTH_BADGE"
        ]
    }

];