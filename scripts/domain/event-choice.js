/**
 * Pokémon Companion
 * Event Choice Domain
 *
 * Represents player choice inside an event.
 *
 * Responsibilities:
 * - Store choice information.
 * - Store effects caused by choice.
 *
 * Does NOT:
 * - Execute effects.
 * - Modify trainer state.
 */

"use strict";


class EventChoice {



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



        //--------------------------------
        // Display
        //--------------------------------


        this.text =
            data.text
            ||
            "";



        //--------------------------------
        // Requirements
        //--------------------------------
        //
        // Example:
        // Need BADGE_BOULDER
        // Need ITEM_SILPH_SCOPE
        //


        this.requirements =
            data.requirements
            ||
            {};




        //--------------------------------
        // Effects
        //--------------------------------
        //
        // Applied after selection
        //


        this.effects =
            data.effects
            ||
            {

                addItems: [],

                removeItems: [],

                addPokemon: [],

                addMoney: 0,

                addBadges: [],

                addHMs: [],

                addKeyItems: [],

                removeKeyItems: [],

                addStoryFlags: [],

                removeStoryFlags: [],

                unlockLocations: [],

                battles: []

            };





        //--------------------------------
        // Follow-up
        //--------------------------------
        //
        // Allows branching events
        //
        // Example:
        // Choosing YES starts next event
        //


        this.nextEvent =
            data.nextEvent
            ||
            null;



    }


}


module.exports =
    EventChoice;