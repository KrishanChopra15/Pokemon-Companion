/**
 * Pokémon Companion
 * FireRed World Gates
 */

"use strict";


module.exports =
[

    //--------------------------------
    // Cerulean City Exit
    //
    // The northern/eastern progression
    // is blocked until Bill is rescued.
    // Bill provides the S.S. Ticket.
    //--------------------------------

    {
        id:
            "CERULEAN_CITY_EXIT_ACCESS",

        location:
            "MAP_CERULEAN_CITY",

        type:
            "HARD_GATE",

        requirement:
        {
            keyItems:
            [
                "SS_TICKET"
            ]
        },

        unlocks:
        [
            "CERULEAN_CITY_EXIT_ACCESS"
        ]
    },


    //--------------------------------
    // Saffron City
    //--------------------------------

    {
        id:
            "SAFFRON_CITY_ACCESS",

        location:
            "MAP_SAFFRON_CITY",

        type:
            "HARD_GATE",

        requirement:
        {
            keyItems:
            [
                "TEA"
            ]
        },

        unlocks:
        [
            "SAFFRON_CITY_AVAILABLE"
        ]
    },


    //--------------------------------
    // Cycling Road
    //--------------------------------

    {
        id:
            "CYCLING_ROAD_ACCESS",

        location:
            "MAP_ROUTE16",

        type:
            "HARD_GATE",

        requirement:
        {
            keyItems:
            [
                "BICYCLE"
            ]
        },

        unlocks:
        [
            "CYCLING_ROAD_AVAILABLE"
        ]
    },


    //--------------------------------
    // Route 12 Snorlax
    //--------------------------------

    {
        id:
            "ROUTE12_SNORLAX_ACCESS",

        location:
            "MAP_ROUTE12",

        type:
            "HARD_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_POKE_FLUTE"
            ]
        },

        unlocks:
        [
            "ROUTE12_SNORLAX_CLEARED"
        ]
    },


    //--------------------------------
    // Route 16 Snorlax
    //--------------------------------

    {
        id:
            "ROUTE16_SNORLAX_ACCESS",

        location:
            "MAP_ROUTE16",

        type:
            "HARD_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_POKE_FLUTE"
            ]
        },

        unlocks:
        [
            "ROUTE16_SNORLAX_CLEARED"
        ]
    },


    //--------------------------------
    // Vermilion Gym
    //
    // Cut is required to access the gym.
    //--------------------------------

    {
        id:
            "VERMILION_GYM_ACCESS",

        location:
            "MAP_VERMILION_CITY_GYM",

        type:
            "HARD_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_CUT"
            ]
        },

        unlocks:
        [
            "VERMILION_GYM_AVAILABLE"
        ]
    },


    //--------------------------------
    // Celadon Gym
    //
    // Cut is required to access the gym.
    //--------------------------------

    {
        id:
            "CELADON_GYM_ACCESS",

        location:
            "MAP_CELADON_CITY_GYM",

        type:
            "HARD_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_CUT"
            ]
        },

        unlocks:
        [
            "CELADON_GYM_AVAILABLE"
        ]
    },


    //--------------------------------
    // Rock Tunnel Flash Warning
    //--------------------------------

    {
        id:
            "ROCK_TUNNEL_FLASH_WARNING",

        location:
            "MAP_ROCK_TUNNEL_1F",

        type:
            "SOFT_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_FLASH"
            ]
        },

        unlocks:
        []
    },


    //--------------------------------
    // Cinnabar Island Surf Access
    //
    // Cinnabar Island is reached by
    // crossing water from the mainland.
    //--------------------------------

    {
        id:
            "CINNABAR_ISLAND_SURF_ACCESS",

        location:
            "MAP_CINNABAR_ISLAND",

        type:
            "HARD_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_SURF"
            ]
        },

        unlocks:
        []
    },


    //--------------------------------
    // Seafoam Islands Surf Access
    //
    // The Seafoam Islands are reached
    // through water routes.
    //--------------------------------

    {
        id:
            "SEAFOAM_ISLANDS_SURF_ACCESS",

        location:
            "MAP_SEAFOAM_ISLANDS_1F",

        type:
            "HARD_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_SURF"
            ]
        },

        unlocks:
        []
    },


    //--------------------------------
    // Power Plant Surf Access
    //
    // The Power Plant is reached by
    // crossing water.
    //--------------------------------

    {
        id:
            "POWER_PLANT_SURF_ACCESS",

        location:
            "MAP_POWER_PLANT",

        type:
            "HARD_GATE",

        requirement:
        {
            abilities:
            [
                "CAN_USE_SURF"
            ]
        },

        unlocks:
        []
    },


    //--------------------------------
    // Cinnabar Gym
    //--------------------------------

    {
        id:
            "CINNABAR_GYM_ACCESS",

        location:
            "MAP_CINNABAR_ISLAND_GYM",

        type:
            "HARD_GATE",

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
            "CINNABAR_GYM_AVAILABLE"
        ]
    },


    //--------------------------------
    // Viridian Gym
    //--------------------------------

    {
        id:
            "VIRIDIAN_GYM_ACCESS",

        location:
            "MAP_VIRIDIAN_CITY_GYM",

        type:
            "HARD_GATE",

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
            "VIRIDIAN_GYM_AVAILABLE"
        ]
    },


    //--------------------------------
    // Victory Road
    //--------------------------------

    {
        id:
            "VICTORY_ROAD_ACCESS",

        location:
            "MAP_VICTORY_ROAD_1F",

        type:
            "HARD_GATE",

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
            "POKEMON_LEAGUE_ACCESS",
            "VICTORY_ROAD_AVAILABLE"
        ]
    },


    //--------------------------------
    // Elite Four
    //--------------------------------

    {
        id:
            "ELITE_FOUR_ACCESS",

        location:
            "MAP_POKEMON_LEAGUE_ENTRANCE",

        type:
            "HARD_GATE",

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
            ],

            storyFlags:
            [
                "POKEMON_LEAGUE_ACCESS"
            ]
        },

        unlocks:
        [
            "ELITE_FOUR_AVAILABLE"
        ]
    }

];
