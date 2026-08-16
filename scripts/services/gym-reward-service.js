/**
 * Pokémon Companion
 * Gym Reward Service
 *
 * Handles rewards after defeating Gym Leaders.
 *
 * Responsibilities:
 * - Give badges.
 * - Give TM rewards.
 * - Unlock field move permissions.
 * - Update completed gyms.
 *
 * Does NOT:
 * - Give HM items.
 * - Handle battles.
 * - Decide gym order.
 * - Check map traversal.
 */

"use strict";


class GymRewardService {



    constructor() {


        this.rewards = {


            //--------------------------------
            // Brock
            // Boulder Badge
            //--------------------------------

            TRAINER_LEADER_BROCK: {


                badge:
                    "BOULDER_BADGE",


                tm:
                    "TM39_ROCK_TOMB",


                abilityUnlocks: [

                    {

                        type:
                            "HM_USAGE",

                        move:
                            "FLASH",

                        description:
                            "Allows Flash to be used outside battle."

                    }

                ]


            },





            //--------------------------------
            // Misty
            // Cascade Badge
            //--------------------------------

            TRAINER_LEADER_MISTY: {


                badge:
                    "CASCADE_BADGE",


                tm:
                    "TM03_WATER_PULSE",


                abilityUnlocks: [

                    {

                        type:
                            "HM_USAGE",

                        move:
                            "CUT",

                        description:
                            "Allows Cut to be used outside battle."

                    }

                ]


            },







            //--------------------------------
            // Lt. Surge
            // Thunder Badge
            //--------------------------------

            TRAINER_LEADER_LT_SURGE: {


                badge:
                    "THUNDER_BADGE",


                tm:
                    "TM34_SHOCK_WAVE",


                abilityUnlocks: [

                    {

                        type:
                            "HM_USAGE",

                        move:
                            "FLY",

                        description:
                            "Allows Fly to be used outside battle."

                    }

                ]


            },







            //--------------------------------
            // Erika
            // Rainbow Badge
            //--------------------------------

            TRAINER_LEADER_ERIKA: {


                badge:
                    "RAINBOW_BADGE",


                tm:
                    "TM19_GIGA_DRAIN",


                abilityUnlocks: [

                    {

                        type:
                            "HM_USAGE",

                        move:
                            "STRENGTH",

                        description:
                            "Allows Strength to be used outside battle."

                    }

                ]


            },







            //--------------------------------
            // Koga
            // Soul Badge
            //--------------------------------

            TRAINER_LEADER_KOGA: {


                badge:
                    "SOUL_BADGE",


                tm:
                    "TM06_TOXIC",


                abilityUnlocks: [

                    {

                        type:
                            "HM_USAGE",

                        move:
                            "SURF",

                        description:
                            "Allows Surf to be used outside battle."

                    }

                ]


            },







            //--------------------------------
            // Sabrina
            // Marsh Badge
            //--------------------------------

            TRAINER_LEADER_SABRINA: {


                badge:
                    "MARSH_BADGE",


                tm:
                    "TM04_CALM_MIND",


                abilityUnlocks: []


            },







            //--------------------------------
            // Blaine
            // Volcano Badge
            //--------------------------------

            TRAINER_LEADER_BLAINE: {


                badge:
                    "VOLCANO_BADGE",


                tm:
                    "TM38_FIRE_BLAST",


                abilityUnlocks: []


            },







            //--------------------------------
            // Giovanni
            // Earth Badge
            //--------------------------------

            TRAINER_LEADER_GIOVANNI: {


                badge:
                    "EARTH_BADGE",


                tm:
                    "TM26_EARTHQUAKE",


                abilityUnlocks: []


            }


        };


    }









    //--------------------------------
    // Get reward data
    //--------------------------------


    getReward(
        gymId
    ) {


        return (

            this.rewards[gymId]

            ||

            null

        );


    }









    //--------------------------------
    // Give rewards
    //--------------------------------


    giveRewards(
        gymId,
        trainerState
    ) {


        const reward =
            this.getReward(
                gymId
            );



        if(
            !reward
        ) {


            return {


                success:false,


                reason:
                    "Unknown gym"


            };


        }







        //--------------------------------
        // Badge
        //--------------------------------


        if(
            reward.badge
        ) {


            trainerState.addBadge(

                reward.badge

            );


        }







        //--------------------------------
        // TM
        //--------------------------------


        if(
            reward.tm
        ) {


            trainerState.addKeyItem(

                reward.tm

            );


        }







        //--------------------------------
        // Field move permissions
        //--------------------------------


        for(
            const ability of reward.abilityUnlocks
        ) {


            if(
                ability.type === "HM_USAGE"
            ) {


                trainerState.addHMAbility(

                    ability.move

                );


            }


        }







        //--------------------------------
        // Mark gym defeated
        //--------------------------------


        trainerState.completeBattle(

            gymId

        );







        return {


            success:true,


            gym:
                gymId,


            rewards:
                reward


        };


    }








    //--------------------------------
    // Check reward exists
    //--------------------------------


    hasReward(
        gymId
    ) {


        return (

            this.rewards[gymId]

            !==

            undefined

        );


    }



}



module.exports =
    GymRewardService;