/**
 * Pokémon Companion
 * World State Service
 *
 * Handles dynamic world changes.
 *
 * Responsibilities:
 * - Check NPC visibility.
 * - Check object visibility.
 * - Check completed events.
 * - Check story flag conditions.
 *
 * Does NOT:
 * - Execute events.
 * - Modify trainer state.
 */

"use strict";


class WorldStateService {



    //--------------------------------
    // Check event visibility
    //--------------------------------


    canShowEvent(
        event,
        trainerState
    )
    {


        //--------------------------------
        // Completed event hiding
        //--------------------------------


        if(
            event.hiddenWhenCompleted
            &&
            trainerState.hasCompletedEvent(
                event.id
            )
        )
        {

            return {

                visible:false,

                reason:
                    "Event completed"

            };

        }





        //--------------------------------
        // Story flag requirements
        //--------------------------------


        const conditions =
            event.conditions
            ||
            {};



        for(
            const flag of conditions.requireStoryFlags || []
        )
        {

            if(
                !trainerState.hasStoryFlag(
                    flag
                )
            )
            {

                return {

                    visible:false,

                    reason:
                        `Missing ${flag}`

                };

            }

        }





        //--------------------------------
        // Excluded flags
        //--------------------------------


        for(
            const flag of conditions.excludeStoryFlags || []
        )
        {

            if(
                trainerState.hasStoryFlag(
                    flag
                )
            )
            {

                return {

                    visible:false,

                    reason:
                        `Blocked by ${flag}`

                };

            }

        }





        return {

            visible:true

        };


    }





    //--------------------------------
    // Check NPC visibility
    //--------------------------------


    canShowNPC(
        npc,
        trainerState
    )
    {


        if(
            !npc
        )
        {

            return {

                visible:false,

                reason:
                    "No NPC data"

            };

        }



        if(
            npc.hiddenAfterEvent
            &&
            trainerState.hasCompletedEvent(
                npc.hiddenAfterEvent
            )
        )
        {

            return {

                visible:false,

                reason:
                    "NPC removed after event"

            };

        }



        return {

            visible:true

        };


    }





    //--------------------------------
    // Check object visibility
    //--------------------------------


    canShowObject(
        object,
        trainerState
    )
    {


        if(
            !object
        )
        {

            return {

                visible:false,

                reason:
                    "No object data"

            };

        }





        if(
            object.hiddenAfterEvent
            &&
            trainerState.hasCompletedEvent(
                object.hiddenAfterEvent
            )
        )
        {

            return {

                visible:false,

                reason:
                    "Object removed after event"

            };

        }





        return {

            visible:true

        };


    }





    //--------------------------------
    // World summary
    //--------------------------------


    getWorldState(
        trainerState
    )
    {


        return {

            completedEvents:
                trainerState.completedEvents,


            storyFlags:
                trainerState.storyFlags,


            eventStates:
                trainerState.eventStates


        };


    }


}



module.exports =
    WorldStateService;