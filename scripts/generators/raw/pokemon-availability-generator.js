/**
 * Pokémon Companion
 * Pokémon Availability Generator
 *
 * Generates Pokémon availability database.
 *
 * Responsibilities:
 * - Save generated availability database.
 * - Create output file.
 *
 * Does NOT:
 * - Extract ROM data.
 * - Parse ROM data.
 * - Build availability rules.
 * - Recommend teams.
 * - Handle battles.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class PokemonAvailabilityGenerator {



    constructor(
        outputDirectory = null
    )
    {


        this.outputDirectory =

            outputDirectory

            ||

            path.join(

                __dirname,

                "../../../database/generated"

            );


    }









    //--------------------------------
    // Generate database
    //--------------------------------


    generate(
        data,
        game
    )
    {


        if(
            !data
            ||
            !data.availability
            ||
            !Array.isArray(
                data.availability
            )
        )
        {

            throw new Error(

                "Invalid availability database"

            );

        }








        //--------------------------------
        // Create game directory
        //--------------------------------


        const gameDirectory =
            path.join(

                this.outputDirectory,

                game

            );








        if(
            !fs.existsSync(
                gameDirectory
            )
        )
        {

            fs.mkdirSync(

                gameDirectory,

                {

                    recursive:true

                }

            );

        }








        //--------------------------------
        // Output file
        //--------------------------------


        const outputPath =
            path.join(

                gameDirectory,

                "pokemon-availability.json"

            );








        fs.writeFileSync(

            outputPath,

            JSON.stringify(

                data.availability,

                null,

                4

            ),

            "utf8"

        );








        console.log();

        console.log(
            "Generated pokemon availability database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Pokemon entries: ${data.availability.length}`
        );








        return {


            success:true,


            file:

                outputPath,


            count:

                data.availability.length


        };


    }



}





module.exports =
    PokemonAvailabilityGenerator;