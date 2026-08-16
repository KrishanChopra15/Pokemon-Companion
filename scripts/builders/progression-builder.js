/**
 * Pokémon Companion
 * Progression Builder
 *
 * Builds progression database.
 *
 * Responsibilities:
 * - Load raw progression data.
 * - Normalize progression records.
 * - Save generated progression database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract progression data.
 * - Calculate player state.
 */

"use strict";


const fs = require("fs");
const path = require("path");


const Progression =
    require("../domain/progression");





class ProgressionBuilder {



    build(game) {



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

                ? raw

                : Object.values(raw);









        //--------------------------------
        // Build
        //--------------------------------


        const progression = {};





        for(
            const record of records
        )
        {



            if(
                !record.id
            )
            {

                continue;

            }





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
        // Save
        //--------------------------------


        fs.mkdirSync(

            generatedPath,

            {
                recursive:true
            }

        );





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






        console.log(
            `Generated ${Object.keys(progression).length} progression records`
        );


    }







    //--------------------------------
    // Future mechanic support
    //--------------------------------


    normalizeRequirement(requirement)
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