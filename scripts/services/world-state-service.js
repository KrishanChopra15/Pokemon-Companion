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
 * - Check progression requirements.
 *
 * Does NOT:
 * - Execute events.
 * - Modify trainer state.
 */

"use strict";


const ProgressionService =
    require("./progression-service");



class WorldStateService {



    constructor(game = "firered") {


        this.progressionService =
            new ProgressionService(
                game
            );


    }






    //--------------------------------
    // Check event visibility
    //--------------------------------


    canShowEvent(
        event,
        trainerState
    ) {



        if(
            !event
        ) {


            return {

                visible:false,

                reason:
                    "No event data"

            };


        }





        //--------------------------------
        // Completed event hiding
        //--------------------------------


        if(
            event.hiddenWhenCompleted
            &&
            trainerState.hasCompletedEvent(
                event.id
            )
        ) {


            return {

                visible:false,

                reason:
                    "Event completed"

            };


        }





        const conditions =
            event.conditions
            ||
            {};







        //--------------------------------
        // Required story flags
        //--------------------------------


        for(
            const flag of
            conditions.requireStoryFlags || []
        ) {


            if(
                !trainerState.hasStoryFlag(
                    flag
                )
            ) {


                return {


                    visible:false,


                    reason:
                        `Missing ${flag}`


                };


            }


        }







        //--------------------------------
        // Excluded story flags
        //--------------------------------


        for(
            const flag of
            conditions.excludeStoryFlags || []
        ) {


            if(
                trainerState.hasStoryFlag(
                    flag
                )
            ) {


                return {


                    visible:false,


                    reason:
                        `Blocked by ${flag}`


                };


            }


        }







        //--------------------------------
        // Progression requirement
        //--------------------------------


        if(
            conditions.progression
        ) {


            const result =
                this.progressionService.canUnlock(

                    conditions.progression,

                    trainerState

                );



            if(
                !result.allowed
            ) {


                return {


                    visible:false,


                    reason:
                        result.reason


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
    ) {


        if(
            !npc
        ) {


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
        ) {


            return {


                visible:false,


                reason:
                    "NPC removed after event"


            };


        }





        if(
            npc.conditions
        ) {


            return this.checkConditions(

                npc.conditions,

                trainerState

            );


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
    ) {


        if(
            !object
        ) {


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
        ) {


            return {


                visible:false,


                reason:
                    "Object removed after event"


            };


        }





        if(
            object.conditions
        ) {


            return this.checkConditions(

                object.conditions,

                trainerState

            );


        }





        return {


            visible:true


        };


    }








    //--------------------------------
    // Generic condition checker
    //--------------------------------


    checkConditions(
        conditions,
        trainerState
    ) {



        for(
            const flag of
            conditions.requireStoryFlags || []
        ) {


            if(
                !trainerState.hasStoryFlag(
                    flag
                )
            ) {


                return {


                    visible:false,


                    reason:
                        `Missing ${flag}`


                };


            }


        }






        for(
            const flag of
            conditions.excludeStoryFlags || []
        ) {


            if(
                trainerState.hasStoryFlag(
                    flag
                )
            ) {


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
    // World summary
    //--------------------------------


    getWorldState(
        trainerState
    ) {


        return {


            completedEvents:

                trainerState.completedEvents || [],



            storyFlags:

                trainerState.storyFlags || [],



            eventStates:

                trainerState.eventStates || {}



        };


    }



}



module.exports =
    WorldStateService;