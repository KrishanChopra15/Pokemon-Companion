/**
 * Pokémon Companion
 * NPC Availability Service
 *
 * Determines active NPCs.
 *
 * Responsibilities:
 * - Filter NPCs using event conditions.
 * - Check story progression.
 *
 * Does NOT:
 * - Execute events.
 * - Modify trainer state.
 */

"use strict";


class NPCAvailabilityService {


    constructor(
        npcService,
        eventService
    ) {


        this.npcService =
            npcService;


        this.eventService =
            eventService;


    }





    getAvailableNPCs(
        location,
        trainerState
    ) {


        const npcs =
            this.npcService
                .getNPCs(
                    location
                );



        return npcs.filter(
            npc => {


                const events =
                    this.eventService
                        .getEventsByNPC(
                            npc.script
                        );



                //--------------------------------
                // NPC without event
                //--------------------------------

                if(
                    events.length === 0
                ) {

                    return true;

                }





                //--------------------------------
                // NPC with events
                //--------------------------------

                return events.some(
                    event => {


                        return this.eventService
                            .canShowEvent(
                                event,
                                trainerState
                            )
                            .visible;


                    }
                );


            }
        );


    }


}


module.exports = NPCAvailabilityService;