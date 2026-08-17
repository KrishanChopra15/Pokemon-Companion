/**
 * Pokémon Companion
 * Gym Event Service
 *
 * Handles gym battle events.
 *
 * Responsibilities:
 * - Resolve gym events.
 * - Provide battle event IDs.
 * - Provide gym trainers.
 * - Complete gym events.
 * - Prevent duplicate completion.
 *
 * Does NOT:
 * - Load database files.
 * - Execute battles.
 * - Handle trainer AI.
 * - Handle battle calculations.
 */

"use strict";





class GymEventService {



    constructor(
        gymDatabaseService
    )
    {

        this.database =
            gymDatabaseService;


    }









    //--------------------------------
    // Lookup
    //--------------------------------


    getGymEvent(
        gymId
    )
    {

        return this.database.getGym(
            gymId
        );


    }









    //--------------------------------
    // Event ID
    //--------------------------------


    getEventId(
        gymId
    )
    {

        const gym =
            this.getGymEvent(
                gymId
            );


        return gym
            ?
            gym.battleEvent
            :
            null;


    }









    //--------------------------------
    // Trainer
    //--------------------------------


    getTrainer(
        gymId
    )
    {

        const gym =
            this.getGymEvent(
                gymId
            );


        return gym
            ?
            gym.trainer
            :
            null;


    }









    //--------------------------------
    // Badge
    //--------------------------------


    getBadge(
        gymId
    )
    {

        const gym =
            this.getGymEvent(
                gymId
            );


        return gym
            ?
            gym.badge
            :
            null;


    }









    //--------------------------------
    // Rewards
    //--------------------------------


    getRewards(
        gymId
    )
    {

        return this.database.getRewards(
            gymId
        );


    }









    //--------------------------------
    // Completion check
    //--------------------------------


    isCompleted(
        gymId,
        trainerState
    )
    {


        const eventId =
            this.getEventId(
                gymId
            );



        if(
            !eventId
        )
        {

            return false;

        }




        if(
            trainerState.hasCompletedEvent
        )
        {

            return trainerState.hasCompletedEvent(
                eventId
            );

        }



        return false;


    }









    //--------------------------------
    // Complete gym event
    //--------------------------------


    completeGym(
        gymId,
        trainerState
    )
    {


        const gym =
            this.getGymEvent(
                gymId
            );



        if(
            !gym
        )
        {

            return {

                success:false,

                reason:
                    "Unknown gym"

            };

        }








        if(
            this.isCompleted(
                gymId,
                trainerState
            )
        )
        {

            return {

                success:false,

                reason:
                    "Gym event already completed"

            };

        }









        //--------------------------------
        // Rewards
        //--------------------------------


        const rewards =
            this.getRewards(
                gymId
            )
            ||
            {};









        //--------------------------------
        // Badge
        //--------------------------------


        if(
            gym.badge
        )
        {

            trainerState.addBadge(

                gym.badge

            );

        }









        //--------------------------------
        // Items
        //--------------------------------


        for(
            const item of rewards.items || []
        )
        {

            trainerState.addItem(

                item

            );

        }









        //--------------------------------
        // HM abilities
        //--------------------------------


        for(
            const ability of rewards.hmAbilities || []
        )
        {

            trainerState.addHMAbility(

                ability

            );

        }









        //--------------------------------
        // Completion
        //--------------------------------


        trainerState.completeBattle(

            gymId

        );



        if(
            trainerState.completeEvent
        )
        {

            trainerState.completeEvent(

                gym.battleEvent

            );

        }









        return {

            success:true,


            gym:
                gymId,


            event:
                gym.battleEvent,


            badge:
                gym.badge,


            rewards

        };


    }









    //--------------------------------
    // All gyms
    //--------------------------------


    getAllGyms()
    {

        return this.database.getAllGyms();


    }





}





module.exports =
    GymEventService;