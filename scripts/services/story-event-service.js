/**
 * Pokémon Companion
 * Story Event Service
 *
 * Converts companion story events
 * into real FireRed ROM events.
 *
 * Responsibilities:
 * - Resolve story aliases.
 * - Find mapped ROM events.
 * - Apply completion flags.
 * - Apply story rewards.
 *
 * Does NOT:
 * - Execute events.
 * - Parse ROM data.
 * - Create events.
 */

"use strict";


const mappings =
    require("../rules/firered-event-mappings");





class StoryEventService {



    constructor(
        eventService
    )
    {


        this.eventService =
            eventService;


    }







    //--------------------------------
    // Resolve story event
    //--------------------------------


    getEvent(
        storyId
    )
    {


        const mapping =
            mappings[storyId];



        if(
            !mapping
        )
        {

            return null;

        }



        return this.eventService.getEvent(
            mapping.eventId
        );


    }









    //--------------------------------
    // Check mapping exists
    //--------------------------------


    hasMapping(
        storyId
    )
    {


        return Boolean(
            mappings[storyId]
        );


    }









    //--------------------------------
    // Get ROM event id
    //--------------------------------


    getEventId(
        storyId
    )
    {


        const mapping =
            mappings[storyId];



        if(
            !mapping
        )
        {

            return null;

        }



        return mapping.eventId;


    }









    //--------------------------------
    // Completion flag
    //--------------------------------


    getCompletionFlag(
        storyId
    )
    {


        const mapping =
            mappings[storyId];



        if(
            !mapping
        )
        {

            return null;

        }



        return mapping.completionFlag || null;


    }









    //--------------------------------
    // Complete story
    //--------------------------------


    completeStoryEvent(
        storyId,
        trainerState
    )
    {


        const mapping =
            mappings[storyId];



        if(
            !mapping
        )
        {

            return {

                success:false,

                reason:
                    "Unknown story event"

            };

        }







        //--------------------------------
        // Completion flag
        //--------------------------------


        if(
            mapping.completionFlag
        )
        {


            trainerState.addStoryFlag(

                mapping.completionFlag

            );


        }








        //--------------------------------
        // Additional rewards
        //--------------------------------


        const rewards =
            mapping.rewards
            ||
            {};





        for(
            const item of rewards.addKeyItems || []
        )
        {


            trainerState.addKeyItem(
                item
            );


        }







        for(
            const flag of rewards.addStoryFlags || []
        )
        {


            trainerState.addStoryFlag(
                flag
            );


        }







        return {

            success:true,

            storyId,

            completionFlag:
                mapping.completionFlag || null

        };


    }





}



module.exports =
    StoryEventService;