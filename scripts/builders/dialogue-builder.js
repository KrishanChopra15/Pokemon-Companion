/**
 * Pokémon Companion
 * Dialogue Builder
 *
 * Builds generated dialogue database.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class DialogueBuilder {



    build(
        dialogues,
        game
    ) {


        const output =
            path.join(
                __dirname,
                "../../database/generated",
                game,
                "dialogues.json"
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
                dialogues,
                null,
                4
            )
        );



        console.log();

        console.log(
            "Generated dialogue database."
        );


        console.log(
            `Dialogues: ${Object.keys(dialogues).length}`
        );


        console.log();


    }


}


module.exports =
    DialogueBuilder;