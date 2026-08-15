/**
 * Pokémon Companion
 * NPC Interaction Service
 *
 * Handles player interaction with NPCs.
 *
 * Responsibilities:
 * - Find NPC event.
 * - Check visibility.
 * - Load dialogue.
 * - Execute event.
 * - Return rewards and choices.
 */

"use strict";


class NPCInteractionService {



    constructor(
        npcService,
        eventService,
        dialogueService
    )
    {


        this.npcService =
            npcService;


        this.eventService =
            eventService;


        this.dialogueService =
            dialogueService;


    }





    //--------------------------------
    // Interact with NPC
    //--------------------------------


    interact(
        npcId,
        trainerState
    )
    {


        //--------------------------------
        // Find event
        //--------------------------------


        const event =
            this.eventService.getEvent(
                npcId
            );



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
        // Load dialogues
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
        // Execute automatic events
        //--------------------------------


        let result =
        null;



        if(
            !choices.length
        )
        {


            result =
                this.eventService.executeEvent(
                    event,
                    trainerState
                );


        }





        //--------------------------------
        // Return interaction
        //--------------------------------


        return {

            success:true,


            npc:
                npcId,


            dialogues,


            choices,


            rewards:
                event.rewards
                ||
                [],


            effects:
                event.effects
                ||
                {},


            result


        };


    }


}


module.exports =
    NPCInteractionService;