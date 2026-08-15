/**
 * Pokémon Companion
 * NPC Service
 *
 * Provides NPC information.
 *
 * Responsibilities:
 * - Load NPC database.
 * - Find NPCs in locations.
 * - Find NPC by ID.
 *
 * Does NOT:
 * - Execute dialogue.
 * - Execute choices.
 * - Modify player state.
 */

"use strict";


const fs = require("fs");
const path = require("path");



class NPCService {


    constructor(game) {


        const file =
            path.join(
                __dirname,
                "../../database/generated",
                game,
                "npcs.json"
            );



        const data =
            JSON.parse(
                fs.readFileSync(
                    file,
                    "utf8"
                )
            );



        this.npcs = [];



        for(
            const location of Object.keys(data)
        ) {


            for(
                const npc of data[location]
            ) {


                this.npcs.push({

                    ...npc,

                    location

                });


            }


        }


    }





    /**
     * Get all NPCs in a location.
     */
    getNPCs(location) {


        return this.npcs
            .filter(
                npc =>
                    npc.location === location
            );


    }





    /**
     * Get NPC by id.
     */
    getNPC(id) {


        return this.npcs.find(
            npc =>
                npc.id === id
        )
        ||
        null;


    }





    /**
     * Get all NPCs.
     */
    getAllNPCs() {


        return this.npcs;


    }


}


module.exports = NPCService;