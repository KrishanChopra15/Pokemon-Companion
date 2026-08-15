/**
 * Pokémon Companion
 * NPC Dialogue Generator
 *
 * Generates dialogue database for:
 * - NPC events
 * - Object events
 */

"use strict";


const fs =
require("fs");


const path =
require("path");



class NPCDialogueGenerator {



generate(
    scripts,
    dialogues,
    npcs,
    objects,
    game
)
{


    const database = {};





    //--------------------------------
    // NPC / Object script dialogues
    //--------------------------------


    for(
        const id of Object.keys(scripts)
    )
    {


        const script =
            scripts[id];



        const extracted =
        {

            id,


            dialogues:
                (script.dialogues || [])
                .map(
                    dialogueID =>
                        dialogues[dialogueID]
                )
                .filter(Boolean)

        };



        if(
            extracted.dialogues.length
        )
        {


            database[id] =
                extracted;


        }


    }







    //--------------------------------
    // Save
    //--------------------------------


    const output =
        path.join(
            __dirname,
            "../../../database/generated",
            game,
            "npc-dialogues.json"
        );



    fs.mkdirSync(
        path.dirname(output),
        {
            recursive:true
        }
    );



    fs.writeFileSync(
        output,
        JSON.stringify(
            database,
            null,
            4
        )
    );





    console.log();

    console.log(
        "Generated NPC dialogue database."
    );


    console.log(
        `NPC dialogues: ${Object.keys(database).length}`
    );





    return database;


}



}


module.exports =
NPCDialogueGenerator;