/**
 * Pokémon Companion
 * NPC Interaction Service
 *
 * Handles player interaction with NPCs.
 *
 * Responsibilities:
 * - Find NPC event.
 * - Resolve story aliases.
 * - Check visibility.
 * - Check completion state.
 * - Load dialogue.
 * - Execute event.
 * - Complete story events.
 * - Return choices.
 *
 * Does NOT:
 * - Parse ROM data.
 * - Create events.
 * - Decide progression.
 */

"use strict";



class NPCInteractionService {



    constructor(
        npcService,
        eventService,
        dialogueService,
        storyEventService = null
    )
    {


        this.npcService =
            npcService;


        this.eventService =
            eventService;


        this.dialogueService =
            dialogueService;


        this.storyEventService =
            storyEventService;


    }









    //--------------------------------
    // Interact
    //--------------------------------


    interact(
        npcId,
        trainerState
    )
    {


        //--------------------------------
        // Find NPC
        //--------------------------------


        const npc =
            this.npcService
            ?
            this.npcService.getNPC(
                npcId
            )
            :
            null;








        //--------------------------------
        // Find direct ROM event
        //--------------------------------


        let event =
            this.eventService.getEvent(
                npcId
            );








        //--------------------------------
        // Resolve story alias
        //--------------------------------


        if(
            !event
            &&
            this.storyEventService
        )
        {

            event =
                this.storyEventService.getEvent(
                    npcId
                );

        }








        if(
            !event
        )
        {

            return {

                success:false,

                reason:
                    "No event found"

            };

        }









        //--------------------------------
        // Completed check
        //--------------------------------


        if(

            event.oneTime

            &&

            trainerState.hasCompletedEvent

            &&

            trainerState.hasCompletedEvent(
                event.id
            )

        )
        {

            return {

                success:false,

                event:
                    event.id,

                reason:
                    "Event already completed"

            };

        }








        //--------------------------------
        // Visibility
        //--------------------------------


        const visibility =
            this.eventService.canShowEvent(
                event,
                trainerState
            );



        if(
            !visibility.visible
        )
        {

            return {

                success:false,

                reason:
                    visibility.reason

            };

        }








        //--------------------------------
        // Dialogue
        //--------------------------------


        const dialogues =
            (event.dialogues || [])
            .map(

                id =>
                    this.dialogueService.getDialogue(
                        id
                    )

            )
            .filter(
                Boolean
            );









        //--------------------------------
        // Choices
        //--------------------------------


        const choices =
            this.eventService.getChoices(
                event,
                trainerState
            );









        //--------------------------------
        // Execute
        //--------------------------------


        let execution =
            null;



        if(
            choices.length === 0
        )
        {

            execution =
                this.eventService.executeEvent(
                    event,
                    trainerState
                );








            //--------------------------------
            // Complete companion story
            //--------------------------------


            if(
                execution.success
                &&
                this.storyEventService
            )
            {


                this.storyEventService.completeStoryEvent(

                    npcId,

                    trainerState

                );


            }


        }









        //--------------------------------
        // Response
        //--------------------------------


        return {


            success:
                execution
                ?
                execution.success
                :
                true,



            npc:
                npc || npcId,



            event:
                event.id,



            dialogues,



            choices,



            rewards:
                event.rewards || [],



            execution


        };


    }



}



module.exports =
    NPCInteractionService;