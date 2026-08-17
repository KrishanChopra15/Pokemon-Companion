/**
 * Pokémon Companion
 * Story Event Map Generator
 *
 * Generates story-event-map.json
 *
 * Responsibilities:
 * - Convert event mappings into generated database.
 *
 * Does NOT:
 * - Extract ROM data.
 * - Execute events.
 * - Handle progression.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class StoryEventMapGenerator {



    generate(
        mappings,
        game
    )
    {


        const output =
            path.join(

                __dirname,

                "../../../database/generated",

                game,

                "story-event-map.json"

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

                mappings,

                null,

                4

            )

        );





        console.log();

        console.log(
            "Generated story event map database."
        );


        console.log(
            `Mappings: ${Object.keys(mappings).length}`
        );


        console.log();



        return mappings;


    }


}



module.exports =
    StoryEventMapGenerator;