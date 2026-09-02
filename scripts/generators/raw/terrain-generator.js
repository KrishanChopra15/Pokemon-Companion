/**
 * Pokémon Companion
 * Terrain Generator
 *
 * Generates raw terrain database.
 *
 * Responsibilities:
 * - Receive extracted terrain data.
 * - Save raw terrain database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Calculate player progression.
 * - Decide world access.
 */

"use strict";


const fs =
    require("fs");

const path =
    require("path");



class TerrainGenerator
{


    generate(
        terrain,
        game
    )
    {


        const file =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "terrain.json"

            );



        fs.mkdirSync(

            path.dirname(file),

            {
                recursive:
                    true
            }

        );



        fs.writeFileSync(

            file,

            JSON.stringify(

                terrain,

                null,

                4

            ),

            "utf8"

        );



        console.log();


        console.log(
            "Generated terrain database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Terrain records: ${Object.keys(terrain).length}`
        );


        console.log();

    }


}



module.exports =
    TerrainGenerator;