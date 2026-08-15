/**
 * Pokémon Companion
 * Event Reward
 *
 * Represents effects given by events.
 */

"use strict";


class EventReward {


    constructor(data)
    {


        this.type =
            data.type || null;


        //--------------------------------
        // Items
        //--------------------------------

        this.item =
            data.item || null;


        this.quantity =
            data.quantity || 1;




        //--------------------------------
        // Pokémon
        //--------------------------------

        this.pokemon =
            data.pokemon || null;




        //--------------------------------
        // TM
        //--------------------------------

        this.tm =
            data.tm || null;




        //--------------------------------
        // Story
        //--------------------------------

        this.flag =
            data.flag || null;




        //--------------------------------
        // World
        //--------------------------------

        this.location =
            data.location || null;




        //--------------------------------
        // Battle
        //--------------------------------

        this.battle =
            data.battle || null;




        //--------------------------------
        // Dialogue
        //--------------------------------

        this.dialogue =
            data.dialogue || null;


    }


}


module.exports =
    EventReward;