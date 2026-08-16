/**
 * Pokémon Companion
 * Gym Service
 *
 * Coordinates gym battles and rewards.
 *
 * Responsibilities:
 * - Check gym availability.
 * - Complete gym battles.
 * - Apply gym rewards.
 * - Update trainer progression.
 *
 * Does NOT:
 * - Execute battles.
 * - Handle Pokémon damage.
 * - Control map traversal.
 */

"use strict";


class GymService {



    constructor(
        gymProgressionService,
        gymRewardService
    ) {


        this.progression =
            gymProgressionService;



        this.rewards =
            gymRewardService;


    }








    //--------------------------------
    // Check gym challenge
    //--------------------------------


    canChallenge(
        gymId,
        trainerState
    ) {


        return this.progression
            .canChallengeGym(

                gymId,

                trainerState

            );


    }









    //--------------------------------
    // Complete gym battle
    //--------------------------------


    completeGym(
        gymId,
        trainerState
    ) {


        //--------------------------------
        // Check availability
        //--------------------------------


        const available =
            this.canChallenge(

                gymId,

                trainerState

            );



        if(
            !available.allowed
        ) {


            return {


                success:false,


                reason:
                    available.reason


            };


        }








        //--------------------------------
        // Give rewards
        //--------------------------------


        const rewardResult =
            this.rewards
                .giveRewards(

                    gymId,

                    trainerState

                );








        if(
            !rewardResult.success
        ) {


            return {


                success:false,


                reason:
                    rewardResult.reason


            };


        }








        return {


            success:true,


            gym:
                gymId,


            rewards:
                rewardResult.rewards



        };


    }









    //--------------------------------
    // Gym status
    //--------------------------------


    getGymStatus(
        gymId,
        trainerState
    ) {


        const gym =
            this.progression
                .getGym(
                    gymId
                );



        if(
            !gym
        ) {


            return {


                exists:false


            };


        }





        return {


            exists:true,


            gym,


            completed:

                trainerState.hasCompletedBattle(

                    gymId

                ),



            canChallenge:

                this.canChallenge(

                    gymId,

                    trainerState

                )



        };


    }







    //--------------------------------
    // Available gyms
    //--------------------------------


    getAvailableGyms(
        trainerState
    ) {


        return this.progression
            .getAvailableGyms(
                trainerState
            );


    }



}



module.exports =
    GymService;