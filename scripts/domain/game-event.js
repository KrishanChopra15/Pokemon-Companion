/**
 * Pokémon Companion
 * Game Event Domain
 *
 * Represents an interactive world event.
 *
 * Responsibilities:
 * - Store event information.
 * - Store requirements.
 * - Store dialogues.
 * - Store rewards/effects.
 * - Store choices.
 *
 * Does NOT:
 * - Execute events.
 * - Modify trainer state.
 */

"use strict";


class GameEvent {



    constructor(
        data = {}
    )
    {


        //--------------------------------
        // Identity
        //--------------------------------


        this.id =
            data.id
            ||
            null;



        this.sourceScript =
            data.sourceScript
            ||
            data.id
            ||
            null;




        //--------------------------------
        // Location / NPC
        //--------------------------------


        this.npc =
            data.npc
            ||
            null;



        this.location =
            data.location
            ||
            null;



        //--------------------------------
        // Trigger
        //--------------------------------


        this.trigger =
            data.trigger
            ||
            "interaction";





        //--------------------------------
        // Progression
        //--------------------------------


        this.requirements =
            data.requirements
            ||
            {};



        this.conditions =
            data.conditions
            ||
            {};



        this.repeatable =
            data.repeatable
            ||
            false;






        //--------------------------------
        // Content
        //--------------------------------


        this.dialogues =
            data.dialogues
            ||
            [];



        this.choices =
            data.choices
            ||
            [];





        //--------------------------------
        // Results
        //--------------------------------


        this.effects =
            data.effects
            ||
            {

                addItems: [],

                addPokemon: [],

                addMoney: 0,

                addStoryFlags: [],

                removeStoryFlags: [],

                battles: []

            };



        this.rewards =
            data.rewards
            ||
            [];



    }


}


module.exports =
    GameEvent;