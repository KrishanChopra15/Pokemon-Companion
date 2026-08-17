/**
 * Pokémon Companion
 * Gym Generator
 *
 * Generates raw gym database.
 *
 * Responsibilities:
 * - Convert gym rules into raw database.
 * - Normalize gym records.
 * - Save gym definitions.
 *
 * Does NOT:
 * - Read ROM data.
 * - Track player progress.
 * - Execute battles.
 * - Build generated databases.
 */

"use strict";


const fs =
    require("fs");

const path =
    require("path");





class GymGenerator {



    generate(
        gyms,
        game = "firered"
    )
    {


        if(
            !gyms
            ||
            !Array.isArray(gyms)
        )
        {

            console.log(
                "No gym data provided."
            );


            return;

        }





        //----------------------------------------
        // Output path
        //----------------------------------------

        const outputDirectory =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game

            );





        fs.mkdirSync(

            outputDirectory,

            {
                recursive:true
            }

        );






        //----------------------------------------
        // Normalize gyms
        //----------------------------------------

        const database =
            [];





        for(
            const gym of gyms
        )
        {


            if(
                !gym.id
            )
            {

                continue;

            }





            database.push(

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
                        gym.requirements || null,


                    rewards:
                        gym.rewards || null


                }

            );


        }








        //----------------------------------------
        // Save
        //----------------------------------------

        const outputFile =
            path.join(

                outputDirectory,

                "gyms.json"

            );





        fs.writeFileSync(

            outputFile,


            JSON.stringify(

                database,

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
            `Gyms: ${database.length}`
        );


        console.log();



    }



}





module.exports =
    GymGenerator;