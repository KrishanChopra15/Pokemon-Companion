/**
 * Pokémon Companion
 * FireRed Availability Rules
 *
 * Defines Pokémon availability checkpoints.
 *
 * Responsibilities:
 * - Define gym progression order.
 * - Define recommended levels.
 * - Define post-game unlock points.
 *
 * Does NOT:
 * - Check player state.
 * - Handle Pokémon.
 * - Handle battles.
 * - Recommend teams.
 */

"use strict";





module.exports =
{

    //--------------------------------
    // Gym 1
    //--------------------------------


    BROCK:
    {

        id:
            "TRAINER_LEADER_BROCK",


        order:
            1,


        recommendedLevel:
            14,


        maxReasonableLevel:
            20

    },









    //--------------------------------
    // Gym 2
    //--------------------------------


    MISTY:
    {

        id:
            "TRAINER_LEADER_MISTY",


        order:
            2,


        recommendedLevel:
            21,


        maxReasonableLevel:
            30

    },









    //--------------------------------
    // Gym 3
    //--------------------------------


    LT_SURGE:
    {

        id:
            "TRAINER_LEADER_LT_SURGE",


        order:
            3,


        recommendedLevel:
            24,


        maxReasonableLevel:
            35

    },









    //--------------------------------
    // Gym 4
    //--------------------------------


    ERIKA:
    {

        id:
            "TRAINER_LEADER_ERIKA",


        order:
            4,


        recommendedLevel:
            29,


        maxReasonableLevel:
            40

    },









    //--------------------------------
    // Gym 5
    //--------------------------------


    KOGA:
    {

        id:
            "TRAINER_LEADER_KOGA",


        order:
            5,


        recommendedLevel:
            43,


        maxReasonableLevel:
            50

    },









    //--------------------------------
    // Gym 6
    //--------------------------------


    SABRINA:
    {

        id:
            "TRAINER_LEADER_SABRINA",


        order:
            6,


        recommendedLevel:
            44,


        maxReasonableLevel:
            55

    },









    //--------------------------------
    // Gym 7
    //--------------------------------


    BLAINE:
    {

        id:
            "TRAINER_LEADER_BLAINE",


        order:
            7,


        recommendedLevel:
            48,


        maxReasonableLevel:
            60

    },









    //--------------------------------
    // Gym 8
    //--------------------------------


    GIOVANNI:
    {

        id:
            "TRAINER_LEADER_GIOVANNI",


        order:
            8,


        recommendedLevel:
            50,


        maxReasonableLevel:
            65

    },









    //--------------------------------
    // Elite Four
    //--------------------------------


    ELITE_FOUR:
    {

        id:
            "ELITE_FOUR",


        order:
            9,


        recommendedLevel:
            55,


        maxReasonableLevel:
            70

    },









    //--------------------------------
    // Champion
    //--------------------------------


    CHAMPION:
    {

        id:
            "CHAMPION",


        order:
            10,


        recommendedLevel:
            60,


        maxReasonableLevel:
            75

    },









    //--------------------------------
    // Post game
    //--------------------------------


    POST_GAME:
    {

        id:
            "POST_GAME",


        order:
            11,


        requirements:
        {

            championDefeated:true

        }

    }

};