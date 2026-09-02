/**
 * Pokémon Companion
 * FireRed Story Rules
 */

"use strict";


module.exports =
[

    //--------------------------------
    // HM05 Acquisition
    //
    // The Route 2 aide gives HM05
    // after the player has caught
    // at least 10 different Pokémon
    // and can use Cut.
    //--------------------------------

    {
        id:
            "HM05_ACQUISITION",

        eventId:
            "Route2_EastBuilding_EventScript_Aide",

        location:
            "MAP_ROUTE2_EAST_BUILDING",

        type:
            "STORY",

        requirement:
        {
            badges:
            [
                "BOULDER_BADGE"
            ],

            abilities:
            [
                "CAN_USE_CUT"
            ],

            conditions:
            {
                caughtPokemon:
                    10
            }
        },

        unlocks:
        [
            "HM05"
        ]
    },


    //--------------------------------
    // HM03 Acquisition
    //
    // The Safari Zone attendant gives
    // HM03 (Surf).
    //--------------------------------

    {
        id:
            "HM03_ACQUISITION",

        eventId:
            "SafariZone_SecretHouse_EventScript_Attendant",

        location:
            "MAP_SAFARI_ZONE_SECRET_HOUSE",

        type:
            "STORY",

        requirement:
        {
            badges:
            []
        },

        unlocks:
        [
            "HM03"
        ]
    },


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
    // Poké Flute
    //
    // Completing the Pokémon Tower
    // event allows the player to use
    // the Poké Flute.
    //--------------------------------

    {
        id:
            "POKE_FLUTE_UNLOCK",

        type:
            "STORY",

        requirement:
        {
            storyFlags:
            [
                "POKEMON_TOWER_COMPLETED"
            ]
        },

        unlocks:
        [
            "CAN_USE_POKE_FLUTE"
        ]
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