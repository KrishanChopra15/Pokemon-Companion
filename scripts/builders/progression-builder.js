/**
 * Pokémon Companion
 * Progression Builder
 *
 * Builds progression database.
 *
 * Responsibilities:
 * - Load raw progression data.
 * - Normalize progression records.
 * - Validate progression records.
 * - Save generated progression database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract progression data.
 * - Calculate player state.
 */

"use strict";


const fs =
    require("fs");

const path =
    require("path");


const Progression =
    require("../domain/progression");





class ProgressionBuilder {



    build(
        game
    )
    {



        const rawPath =
            path.join(

                __dirname,

                "../../database/raw",

                game

            );





        const generatedPath =
            path.join(

                __dirname,

                "../../database/generated",

                game

            );





        const input =
            path.join(

                rawPath,

                "progression.json"

            );









        //--------------------------------
        // Check database exists
        //--------------------------------


        if(
            !fs.existsSync(input)
        )
        {

            console.log(
                "No progression database found."
            );


            return;

        }









        //--------------------------------
        // Load raw data
        //--------------------------------


        const raw =
            JSON.parse(

                fs.readFileSync(

                    input,

                    "utf8"

                )

            );







        const records =

            Array.isArray(raw)

                ?

                raw

                :

                Object.values(raw);









        //--------------------------------
        // Build
        //--------------------------------


        const progression = {};



        let skipped =
            0;





        for(
            const record of records
        )
        {





            //--------------------------------
            // Validate ID
            //--------------------------------


            if(
                !record.id
            )
            {

                console.warn(

                    "Skipping progression without ID:",
                    record

                );


                skipped++;

                continue;

            }








            //--------------------------------
            // Duplicate protection
            //--------------------------------


            if(
                progression[record.id]
            )
            {

                console.warn(

                    `Duplicate progression id detected: ${record.id}`

                );


                skipped++;

                continue;

            }









            //--------------------------------
            // Create domain object
            //--------------------------------


            const entry =
                new Progression({

                    id:
                        record.id,


                    location:
                        record.location || null,


                    type:
                        record.type || null,


                    requirement:
                        this.normalizeRequirement(

                            record.requirement

                        ),


                    unlocks:
                        record.unlocks || []


                });









            //--------------------------------
            // Store generated record
            //--------------------------------


            progression[entry.id] =
            {


                id:
                    entry.id,


                location:
                    entry.location,



                type:
                    entry.type,



                requirement:
                    entry.requirement,



                unlocks:
                    entry.unlocks



            };



        }









        //--------------------------------
        // Create output folder
        //--------------------------------


        fs.mkdirSync(

            generatedPath,

            {
                recursive:true
            }

        );









        //--------------------------------
        // Save database
        //--------------------------------


        fs.writeFileSync(

            path.join(

                generatedPath,

                "progression.json"

            ),


            JSON.stringify(

                progression,

                null,

                2

            ),


            "utf8"

        );









        //--------------------------------
        // Build report
        //--------------------------------


        console.log(

            `Generated ${Object.keys(progression).length} progression records`

        );



        if(
            skipped > 0
        )
        {

            console.log(

                `Skipped ${skipped} invalid records`

            );

        }


    }









    //--------------------------------
    // Normalize requirements
    //--------------------------------


    normalizeRequirement(
        requirement
    )
    {


        if(
            !requirement
        )
        {

            return null;

        }







        if(
            typeof requirement === "string"
        )
        {

            return {

                type:
                    requirement

            };

        }








        return {

            ...requirement

        };


    }



}





module.exports =
    ProgressionBuilder;