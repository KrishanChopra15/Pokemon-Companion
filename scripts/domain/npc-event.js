/**
 * Pokémon Companion
 * NPC Event Domain
 *
 * Represents interactive NPC events.
 *
 * Does NOT:
 * - Execute events.
 * - Modify player state.
 * - Handle progression.
 */

"use strict";


class NPCEvent {


    constructor(data) {


        this.id =
            data.id;


        this.location =
            data.location;


        this.npc =
            data.npc;



        this.requirements =
            data.requirements || {};



        this.actions =
            data.actions || [];



    }



}


module.exports = NPCEvent;