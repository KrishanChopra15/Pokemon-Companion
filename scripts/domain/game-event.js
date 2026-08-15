/**
 * Pokémon Companion
 * Game Event Domain
 *
 * Represents an interactive world event.
 *
 * Responsibilities:
 * - Store event information.
 * - Store requirements.
 * - Store conditions.
 * - Store dialogues.
 * - Store rewards/effects.
 * - Store choices.
 * - Store world state information.
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



        this.npcData =
            data.npcData
            ||
            null;



        this.location =
            data.location
            ||
            null;



        this.position =
            data.position
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
        // World State
        //--------------------------------


        this.state =
            data.state
            ||
            "active";



        this.hiddenWhenCompleted =
            data.hiddenWhenCompleted
            ||
            false;



        this.oneTime =
            !this.repeatable;





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

                removeItems: [],

                addPokemon: [],

                addEggs: [],

                addTMs: [],

                addKeyItems: [],

                addMoney: 0,

                removeMoney: 0,

                addStoryFlags: [],

                removeStoryFlags: [],

                battles: []

            };





        //--------------------------------
        // Rewards
        //--------------------------------


        this.rewards =
            data.rewards
            ||
            [];





        //--------------------------------
        // Helpers
        //--------------------------------


        this.completed =
            false;


    }





    //--------------------------------
    // Event State Helpers
    //--------------------------------


    isCompleted()
    {

        return this.completed;

    }





    complete()
    {

        this.completed = true;


        if(
            this.hiddenWhenCompleted
        )
        {

            this.state =
                "hidden";

        }
        else
        {

            this.state =
                "completed";

        }


    }





    isVisible()
    {

        return (
            this.state !== "hidden"
        );

    }



}



module.exports =
    GameEvent;