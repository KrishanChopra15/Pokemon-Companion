/**
 * Pokémon Companion
 * Dialogue Service
 *
 * Provides NPC dialogue.
 *
 * Responsibilities:
 * - Load dialogue database.
 * - Find dialogue by ID.
 * - Search dialogues.
 *
 * Does NOT:
 * - Execute events.
 * - Modify trainer state.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class DialogueService {



    constructor(game) {


        const file =
            path.join(
                __dirname,
                "../../database/raw",
                game,
                "dialogues.json"
            );



        const data =
            JSON.parse(
                fs.readFileSync(
                    file,
                    "utf8"
                )
            );



        this.dialogues =
            data;


    }





    /**
     * Get dialogue by ID
     */

    getDialogue(id) {


        return this.dialogues[id]
            ||
            null;


    }





    /**
     * Search dialogue IDs
     */

    search(query) {


        const value =
            query.toLowerCase();



        return Object.values(
            this.dialogues
        )
        .filter(
            dialogue =>

                dialogue.id
                    .toLowerCase()
                    .includes(value)

        );


    }





    /**
     * Get all dialogues
     */

    getAll() {


        return this.dialogues;


    }


}


module.exports =
    DialogueService;