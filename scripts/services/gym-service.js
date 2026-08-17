/**
 * Pokémon Companion
 * Gym Service
 *
 * Coordinates gym progression.
 *
 * Responsibilities:
 * - Check gym availability.
 * - Resolve gym data.
 * - Resolve gym trainers.
 * - Resolve gym events.
 * - Apply gym rewards.
 * - Complete gym progression.
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
        gymEventService,
        gymRewardService,
        trainerDatabaseService = null
    )
    {


        this.progression =
            gymProgressionService;



        this.events =
            gymEventService;



        this.rewards =
            gymRewardService;



        this.trainers =
            trainerDatabaseService;


    }









    //--------------------------------
    // Gym lookup
    //--------------------------------


    getGym(
        gymId
    )
    {

        return this.progression
            .getGym(
                gymId
            );

    }









    getAllGyms()
    {

        return this.progression
            .getAllGyms();

    }









    //--------------------------------
    // Trainer lookup
    //--------------------------------


    hasTrainerDatabase()
    {

        return this.trainers !== null;

    }








    getGymTrainerId(
        gymId
    )
    {

        const gym =
            this.getGym(
                gymId
            );


        return gym
            ?
            gym.trainer
            :
            null;


    }









    getGymTrainer(
        gymId
    )
    {


        if(
            !this.hasTrainerDatabase()
        )
        {

            return null;

        }



        const trainerId =
            this.getGymTrainerId(
                gymId
            );



        if(
            !trainerId
        )
        {

            return null;

        }



        return this.trainers.getTrainer(

            trainerId

        );


    }









    //--------------------------------
    // Challenge
    //--------------------------------


    canChallenge(
        gymId,
        trainerState
    )
    {

        return this.progression
            .canChallengeGym(

                gymId,

                trainerState

            );

    }









    //--------------------------------
    // Event
    //--------------------------------


    getGymEvent(
        gymId
    )
    {

        return this.events
            .getGymEvent(
                gymId
            );

    }









    //--------------------------------
    // Battle data
    //--------------------------------


    getBattleData(
        gymId
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        if(
            !gym
        )
        {

            return null;

        }





        return {

            gymId,


            gym,


            trainerId:

                this.getGymTrainerId(
                    gymId
                ),


            trainer:

                this.getGymTrainer(
                    gymId
                ),


            event:

                this.getGymEvent(
                    gymId
                )


        };


    }









    //--------------------------------
    // Complete gym
    //--------------------------------


    completeGym(
        gymId,
        trainerState
    )
    {


        const check =
            this.canChallenge(

                gymId,

                trainerState

            );



        if(
            !check.allowed
        )
        {

            return {

                success:false,

                reason:
                    check.reason

            };

        }







        const event =
            this.getGymEvent(
                gymId
            );



        if(
            !event
        )
        {

            return {

                success:false,

                reason:
                    "Missing gym event"

            };

        }








        //--------------------------------
        // Apply rewards
        //--------------------------------


        let rewardResult =
        {

            success:true,

            rewards:{}

        };



        if(
            this.rewards
        )
        {

            rewardResult =
                this.rewards.giveRewards(

                    gymId,

                    trainerState

                );

        }



        if(
            !rewardResult.success
        )
        {

            return rewardResult;

        }








        //--------------------------------
        // Complete event
        //--------------------------------


        if(
            trainerState.completeEvent
        )
        {

            trainerState.completeEvent(

                event.battleEvent

            );

        }








        return {

            success:true,


            gym:

                gymId,


            event:

                event.battleEvent,


            badge:

                event.badge,


            rewards:

                rewardResult.rewards


        };


    }









    //--------------------------------
    // Status
    //--------------------------------


    getGymStatus(
        gymId,
        trainerState
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        if(
            !gym
        )
        {

            return {

                exists:false

            };

        }








        return {

            exists:true,


            gym,


            trainer:

                this.getGymTrainer(
                    gymId
                ),


            event:

                this.getGymEvent(
                    gymId
                ),


            completed:

                trainerState.hasCompletedBattle

                &&

                trainerState.hasCompletedBattle(
                    gymId
                ),


            availability:

                this.canChallenge(

                    gymId,

                    trainerState

                )


        };


    }









    //--------------------------------
    // Progression
    //--------------------------------


    getAvailableGyms(
        trainerState
    )
    {

        return this.progression
            .getAvailableGyms(

                trainerState

            );

    }








    getRecommendedNextGym(
        trainerState
    )
    {

        return this.progression
            .getRecommendedNextGyms(

                trainerState

            );

    }








    getProgressionStats(
        trainerState
    )
    {

        return {

            total:

                this.progression.getGymCount(),


            completed:

                this.progression
                    .getCompletedGymCount(

                        trainerState

                    )

        };

    }



}





module.exports =
    GymService;