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
 * - Define hard progression gates.
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
                "CASCADE_BADGE",
                "THUNDER_BADGE"
            ]
        },

        unlocks:
        [
            "RAINBOW_BADGE"
        ]

    },


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
                "CASCADE_BADGE",
                "THUNDER_BADGE",
                "RAINBOW_BADGE"
            ]
        },

        unlocks:
        [
            "SOUL_BADGE"
        ]

    },


    {
        id:
            "SAFFRON_GYM_COMPLETE",

        location:
            "MAP_SAFFRON_CITY_GYM",

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
                "SOUL_BADGE"
            ],

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


    //----------------------------------------
    // Gym 7 hard gate
    //
    // Cinnabar Island requires access to
    // the island. Surf is the hard traversal
    // requirement.
    //----------------------------------------


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
            ]
        },

        unlocks:
        [
            "CINNABAR_GYM_AVAILABLE"
        ]

    },


    {
        id:
            "CINNABAR_GYM_COMPLETE",

        location:
            "MAP_CINNABAR_ISLAND_GYM",

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
                "MARSH_BADGE"
            ],

            abilities:
            [
                "CAN_USE_SURF"
            ]
        },

        unlocks:
        [
            "VOLCANO_BADGE"
        ]

    },


    //----------------------------------------
    // Gym 8 hard gate
    //
    // Viridian Gym becomes available only
    // after the Silph Co. story event and
    // after the first seven badges.
    //----------------------------------------


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


    //----------------------------------------
    // Saffron City access
    //
    // Tea opens the Saffron City gates.
    // This is NOT the same thing as
    // completing Silph Co.
    //----------------------------------------


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
            "SAFFRON_CITY_ACCESS"
        ]

    },


    //----------------------------------------
    // Silph Co. completion
    //
    // The story event itself establishes
    // the flag used by later progression.
    //----------------------------------------


    {
        id:
            "SILPH_CO_COMPLETION",

        location:
            "MAP_SILPH_CO_7F",

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
            "SILPH_CO_COMPLETED"
        ]

    },


    //----------------------------------------
    // Victory Road hard gate
    //
    // The player must have all eight badges.
    //----------------------------------------


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


    //----------------------------------------
    // Elite Four hard gate
    //
    // The player must have all eight badges
    // and access to Victory Road.
    //----------------------------------------


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

            flags:
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