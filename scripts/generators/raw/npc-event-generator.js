/**
 * Pokémon Companion
 * NPC Event Generator
 *
 * Generates NPC database.
 *
 * Responsibilities:
 * - Convert extracted NPC events.
 * - Write NPC database.
 *
 * Does NOT:
 * - Extract maps.
 * - Handle dialogue.
 * - Handle event logic.
 */

"use strict";


const fs = require("fs");
const path = require("path");



class NPCEventGenerator {


    generate(
        npcs,
        game
    ) {


        const outputPath =
            path.join(
                __dirname,
                "../../../database/generated",
                game,
                "npcs.json"
            );



        const database = {};



        for(
            const location of Object.keys(npcs)
        ) {


            database[location] =
                npcs[location]
                    .map(
                        npc => {


                            return {

                                id:
                                    npc.script,


                                name:
                                    this.getNPCName(
                                        npc
                                    ),


                                graphics:
                                    npc.graphics,


                                script:
                                    npc.script,


                                position:
                                    npc.position


                            };


                        }
                    );


        }



        fs.mkdirSync(
            path.dirname(outputPath),
            {
                recursive:true
            }
        );



        fs.writeFileSync(
            outputPath,
            JSON.stringify(
                database,
                null,
                4
            )
        );



        console.log();


        console.log(
            `Generated NPC database.`
        );


        console.log(
            `Locations: ${Object.keys(database).length}`
        );


        console.log();



        return database;


    }





    getNPCName(
        npc
    ) {


        switch(
            npc.graphics
        ) {


            case "OBJ_EVENT_GFX_BILL":

                return "Bill";


            case "OBJ_EVENT_GFX_NURSE":

                return "Nurse Joy";


            default:

                return null;


        }


    }


}


module.exports = NPCEventGenerator;