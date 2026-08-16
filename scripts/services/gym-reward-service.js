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


            TRAINER_LEADER_BROCK: {

                badge:
                    "BOULDER_BADGE",


                tm:
                    "TM39_ROCK_TOMB",


                abilityUnlocks:
                [

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





            TRAINER_LEADER_MISTY: {

                badge:
                    "CASCADE_BADGE",


                tm:
                    "TM03_WATER_PULSE",


                abilityUnlocks:
                [

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





            TRAINER_LEADER_LT_SURGE: {

                badge:
                    "THUNDER_BADGE",


                tm:
                    "TM34_SHOCK_WAVE",


                abilityUnlocks:
                [

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





            TRAINER_LEADER_ERIKA: {

                badge:
                    "RAINBOW_BADGE",


                tm:
                    "TM19_GIGA_DRAIN",


                abilityUnlocks:
                [

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





            TRAINER_LEADER_KOGA: {

                badge:
                    "SOUL_BADGE",


                tm:
                    "TM06_TOXIC",


                abilityUnlocks:
                [

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





            TRAINER_LEADER_SABRINA: {

                badge:
                    "MARSH_BADGE",


                tm:
                    "TM04_CALM_MIND",


                abilityUnlocks:[]

            },





            TRAINER_LEADER_BLAINE: {

                badge:
                    "VOLCANO_BADGE",


                tm:
                    "TM38_FIRE_BLAST",


                abilityUnlocks:[]

            },





            TRAINER_LEADER_GIOVANNI: {

                badge:
                    "EARTH_BADGE",


                tm:
                    "TM26_EARTHQUAKE",


                abilityUnlocks:[]

            }


        };


    }







    getReward(gymId)
    {

        return (

            this.rewards[gymId]

            ||

            null

        );

    }








    giveRewards(
        gymId,
        trainerState
    )
    {


        const reward =
            this.getReward(
                gymId
            );



        if(!reward)
        {

            return {

                success:false,

                reason:
                    "Unknown gym"

            };

        }







        // Badge

        if(
            reward.badge
        )
        {

            trainerState.addBadge(
                reward.badge
            );

        }







        // TM

        if(
            reward.tm
        )
        {

            if(
                trainerState.addItem
            )
            {

                trainerState.addItem(
                    reward.tm
                );

            }

            else
            {

                trainerState.addKeyItem(
                    reward.tm
                );

            }


        }








        // HM field abilities

        for(
            const ability of reward.abilityUnlocks
        )
        {


            if(
                ability.type === "HM_USAGE"
            )
            {


                trainerState.addHMAbility(
                    ability.move
                );


            }


        }








        // Mark gym defeated

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








    hasReward(gymId)
    {


        return (

            this.rewards[gymId]

            !==

            undefined

        );


    }


}



module.exports =
    GymRewardService;