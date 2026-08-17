/**
 * Pokémon Companion
 * FireRed Gym Rules
 *
 * Source definitions for Pokémon FireRed gym progression.
 *
 * Responsibilities:
 * - Define gym leaders.
 * - Define gym locations.
 * - Define badges.
 * - Define battle trainers.
 * - Define unlock requirements.
 * - Define rewards.
 *
 * Does NOT:
 * - Generate databases.
 * - Track player progress.
 * - Execute battles.
 * - Read ROM data.
 */

"use strict";


module.exports = [



    //----------------------------------------
    // Gym 1 - Brock
    //----------------------------------------

    {
        id:
            "TRAINER_LEADER_BROCK",

        name:
            "Brock",

        city:
            "PEWTER_CITY",

        location:
            "MAP_PEWTER_GYM",

        order:
            1,


        trainer:
            "BROCK",


        badge:
            "BOULDER_BADGE",


        battleEvent:
            "PewterGym_BrockBattle",



        requirements:
        {

            storyFlags:
            [
                "POKEDEX_RECEIVED"
            ]

        },



        rewards:
        {

            items:
            [
                "TM39_ROCK_TOMB"
            ],


            hmAbilities:
            [
                "FLASH"
            ]

        }

    },








    //----------------------------------------
    // Gym 2 - Misty
    //----------------------------------------

    {

        id:
            "TRAINER_LEADER_MISTY",


        name:
            "Misty",


        city:
            "CERULEAN_CITY",


        location:
            "MAP_CERULEAN_GYM",


        order:
            2,


        trainer:
            "MISTY",


        badge:
            "CASCADE_BADGE",


        battleEvent:
            "CeruleanGym_MistyBattle",



        requirements:
        {

            access:
                "CERULEAN_CITY"

        },



        rewards:
        {

            items:
            [
                "TM29_PSYCHIC"
            ]

        }

    },









    //----------------------------------------
    // Gym 3 - Lt. Surge
    //----------------------------------------

    {

        id:
            "TRAINER_LEADER_LT_SURGE",


        name:
            "Lt. Surge",


        city:
            "VERMILION_CITY",


        location:
            "MAP_VERMILION_GYM",


        order:
            3,


        trainer:
            "LT_SURGE",


        badge:
            "THUNDER_BADGE",


        battleEvent:
            "VermilionGym_LtSurgeBattle",



        requirements:
        {

            access:
                "VERMILION_CITY",


            hms:
            [
                "CUT"
            ]

        },



        rewards:
        {

            hmAbilities:
            [
                "FLY"
            ]

        }

    },









    //----------------------------------------
    // Gym 4 - Erika
    //----------------------------------------

    {

        id:
            "TRAINER_LEADER_ERIKA",


        name:
            "Erika",


        city:
            "CELADON_CITY",


        location:
            "MAP_CELADON_GYM",


        order:
            4,


        trainer:
            "ERIKA",


        badge:
            "RAINBOW_BADGE",


        battleEvent:
            "CeladonGym_ErikaBattle",



        requirements:
        {

            access:
                "CELADON_CITY",


            hms:
            [
                "CUT"
            ]

        },



        rewards:
        {

            items:
            [
                "TM19_GIGA_DRAIN"
            ]

        }

    },









    //----------------------------------------
    // Gym 5 - Koga
    //----------------------------------------

    {

        id:
            "TRAINER_LEADER_KOGA",


        name:
            "Koga",


        city:
            "FUCHSIA_CITY",


        location:
            "MAP_FUCHSIA_GYM",


        order:
            5,


        trainer:
            "KOGA",


        badge:
            "SOUL_BADGE",


        battleEvent:
            "FuchsiaGym_KogaBattle",



        requirements:
        {

            access:
                "FUCHSIA_CITY"

        },



        rewards:
        {

            items:
            [
                "TM06_TOXIC"
            ]

        }

    },









    //----------------------------------------
    // Gym 6 - Sabrina
    //----------------------------------------

    {

        id:
            "TRAINER_LEADER_SABRINA",


        name:
            "Sabrina",


        city:
            "SAFFRON_CITY",


        location:
            "MAP_SAFFRON_GYM",


        order:
            6,


        trainer:
            "SABRINA",


        badge:
            "MARSH_BADGE",


        battleEvent:
            "SaffronGym_SabrinaBattle",



        requirements:
        {

            storyFlags:
            [
                "SILPH_CO_COMPLETED"
            ],


            access:
                "SAFFRON_CITY",


            hms:
            [
                "CUT"
            ]

        },



        rewards:
        {

            items:
            [
                "TM04_CALM_MIND"
            ]

        }

    },









    //----------------------------------------
    // Gym 7 - Blaine
    //----------------------------------------

    {

        id:
            "TRAINER_LEADER_BLAINE",


        name:
            "Blaine",


        city:
            "CINNABAR_ISLAND",


        location:
            "MAP_CINNABAR_GYM",


        order:
            7,


        trainer:
            "BLAINE",


        badge:
            "VOLCANO_BADGE",


        battleEvent:
            "CinnabarGym_BlaineBattle",



        requirements:
        {

            access:
                "CINNABAR_ISLAND",


            hms:
            [
                "SURF"
            ],


            keyItems:
            [
                "SECRET_KEY"
            ]

        },



        rewards:
        {

            items:
            [
                "TM38_FIRE_BLAST"
            ]

        }

    },









    //----------------------------------------
    // Gym 8 - Giovanni
    //----------------------------------------

    {

        id:
            "TRAINER_LEADER_GIOVANNI",


        name:
            "Giovanni",


        city:
            "VIRIDIAN_CITY",


        location:
            "MAP_VIRIDIAN_GYM",


        order:
            8,


        trainer:
            "GIOVANNI",


        badge:
            "EARTH_BADGE",


        battleEvent:
            "ViridianGym_GiovanniBattle",



        requirements:
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
                "CINNABAR_GYM_COMPLETED"
            ],


            access:
                "VIRIDIAN_CITY"

        },



        rewards:
        {

            items:
            [
                "TM26_EARTHQUAKE"
            ]

        }

    }



];