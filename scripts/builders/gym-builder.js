/**
 * Pokémon Companion
 * Gym Builder
 *
 * Builds generated gym database.
 *
 * Responsibilities:
 * - Load raw gym database.
 * - Normalize gym records.
 * - Create lookup structure.
 * - Save generated gym database.
 *
 * Does NOT:
 * - Read ROM data.
 * - Extract gym data.
 * - Handle battles.
 * - Track player state.
 */

"use strict";


const fs =
    require("fs");

const path =
    require("path");





class GymBuilder {



    build(
        game = "firered"
    )
    {


        //----------------------------------------
        // Paths
        //----------------------------------------


        const rawFile =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "gyms.json"

            );



        const generatedDirectory =
            path.join(

                process.cwd(),

                "database",

                "generated",

                game

            );






        //----------------------------------------
        // Check database exists
        //----------------------------------------


        if(
            !fs.existsSync(rawFile)
        )
        {

            console.log(
                "No gym database found."
            );


            return;

        }









        //----------------------------------------
        // Load raw gyms
        //----------------------------------------


        const raw =
            JSON.parse(

                fs.readFileSync(

                    rawFile,

                    "utf8"

                )

            );








        //----------------------------------------
        // Build generated structure
        //----------------------------------------


        const gyms =
            {};





        for(
            const gym of raw
        )
        {


            if(
                !gym.id
            )
            {

                continue;

            }






            gyms[gym.id] =
            {


                id:
                    gym.id,



                name:
                    gym.name || null,



                city:
                    gym.city || null,



                location:
                    gym.location || null,



                order:
                    gym.order || null,



                trainer:
                    gym.trainer || null,



                badge:
                    gym.badge || null,



                battleEvent:
                    gym.battleEvent || null,



                requirements:
                    gym.requirements || {},



                rewards:
                    gym.rewards || {}



            };



        }









        //----------------------------------------
        // Save generated database
        //----------------------------------------


        fs.mkdirSync(

            generatedDirectory,

            {
                recursive:true
            }

        );





        const outputFile =
            path.join(

                generatedDirectory,

                "gyms.json"

            );







        fs.writeFileSync(

            outputFile,


            JSON.stringify(

                gyms,

                null,

                2

            ),


            "utf8"

        );







        console.log();

        console.log(
            "Generated gym database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Gyms: ${Object.keys(gyms).length}`
        );


        console.log();



    }



}





module.exports =
    GymBuilder;