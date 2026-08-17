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
 * - Load gym database.
 * - Handle battles.
 * - Decide gym order.
 * - Check map traversal.
 */

"use strict";





class GymRewardService {



    constructor(
        gymDatabaseService
    )
    {

        this.database =
            gymDatabaseService;


    }









    //--------------------------------
    // Get reward
    //--------------------------------


    getReward(
        gymId
    )
    {


        const gym =
            this.database.getGym(
                gymId
            );



        if(
            !gym
        )
        {

            return null;

        }




        return {


            badge:

                gym.badge,


            rewards:

                gym.rewards || {}


        };


    }









    //--------------------------------
    // Give rewards
    //--------------------------------


    giveRewards(
        gymId,
        trainerState
    )
    {


        const reward =
            this.getReward(
                gymId
            );



        if(
            !reward
        )
        {

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
        )
        {

            trainerState.addBadge(

                reward.badge

            );

        }









        //--------------------------------
        // Items / TM
        //--------------------------------


        const items =
            reward.rewards.items
            ||
            [];



        for(
            const item of items
        )
        {

            trainerState.addItem(

                item

            );

        }









        //--------------------------------
        // HM abilities
        //--------------------------------


        const abilities =
            reward.rewards.hmAbilities
            ||
            [];



        for(
            const ability of abilities
        )
        {

            trainerState.addHMAbility(

                ability

            );

        }









        //--------------------------------
        // Complete gym
        //--------------------------------


        trainerState.completeBattle(

            gymId

        );









        return {


            success:true,


            gym:
                gymId,


            badge:
                reward.badge,


            rewards:
                reward.rewards



        };


    }









    //--------------------------------
    // Check reward exists
    //--------------------------------


    hasReward(
        gymId
    )
    {


        return this.database.hasGym(

            gymId

        );


    }









    //--------------------------------
    // Get all rewards
    //--------------------------------


    getAllRewards()
    {


        return this.database
            .getAllGyms()
            .map(

                gym =>

                ({

                    id:
                        gym.id,


                    badge:
                        gym.badge,


                    rewards:
                        gym.rewards


                })

            );


    }



}





module.exports =
    GymRewardService;