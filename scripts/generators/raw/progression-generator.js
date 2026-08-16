/**
 * Pokémon Companion
 * Progression Generator
 *
 * Generates raw progression database.
 *
 * Responsibilities:
 * - Receive progression rules.
 * - Normalize progression records.
 * - Save raw progression database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract progression data.
 * - Calculate player state.
 */

"use strict";


const fs = require("fs");
const path = require("path");



class ProgressionGenerator {



    /**
     * Generate progression database.
     *
     * @param {Array} rules
     * @param {string} game
     */
    generate(
        rules,
        game = "firered"
    )
    {



        //----------------------------------------
        // Normalize rules
        //----------------------------------------


        const output =

            rules.map(rule => ({


                id:
                    rule.id || null,


                location:
                    rule.location || null,


                type:
                    rule.type || null,


                requirement:
                    this.normalizeRequirement(
                        rule.requirement
                    ),


                unlocks:
                    rule.unlocks || []



            }));








        //----------------------------------------
        // Save raw database
        //----------------------------------------


        const file = path.join(


            process.cwd(),


            "database",


            "raw",


            game,


            "progression.json"


        );





        fs.mkdirSync(


            path.dirname(file),


            {
                recursive:true
            }


        );







        fs.writeFileSync(


            file,


            JSON.stringify(

                output,

                null,

                4

            ),


            "utf8"


        );







        console.log();


        console.log(
            "Generated progression database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Progression records: ${output.length}`
        );


        console.log();



    }







    /**
     * Normalize requirement object.
     *
     * Future support:
     * - badges
     * - items
     * - story flags
     * - conditions
     *
     * @param {Object|null} requirement
     * @returns {Object|null}
     */
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



        return {


            badges:

                requirement.badges
                ||
                [],



            keyItems:

                requirement.keyItems
                ||
                [],



            storyFlags:

                requirement.storyFlags
                ||
                [],



            conditions:

                requirement.conditions
                ||
                {}



        };


    }



}



module.exports =
    ProgressionGenerator;