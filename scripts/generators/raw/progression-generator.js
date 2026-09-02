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


const fs =
    require("fs");


const path =
    require("path");





class ProgressionGenerator
{


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
        // Validate rules
        //----------------------------------------

        if(
            !Array.isArray(
                rules
            )
        )
        {

            throw new Error(
                "Invalid progression rules"
            );

        }


        //----------------------------------------
        // Normalize rules
        //----------------------------------------

        const output =
            rules.map(
            
                rule =>
                ({
                
                    id:
                        rule.id
                        ||
                        null,
                
                
                    eventId:
                        rule.eventId
                        ||
                        null,
                
                
                    location:
                        rule.location
                        ||
                        null,
                
                
                    type:
                        rule.type
                        ||
                        null,
                
                
                    requirement:
                        this.normalizeRequirement(
                        
                            rule.requirement
                        
                        ),
                    
                    
                    unlocks:
                        Array.isArray(
                            rule.unlocks
                        )
                        ?
                        [
                            ...new Set(
                                rule.unlocks
                            )
                        ]
                        :
                        []
                    
                })
            
            );


        //----------------------------------------
        // Remove duplicate IDs
        //----------------------------------------

        const unique = [];


        const seen =
            new Set();


        for(
            const rule of
                output
        )
        {

            if(
                !rule.id
            )
            {

                continue;

            }


            if(
                seen.has(
                    rule.id
                )
            )
            {

                console.warn(

                    `Duplicate progression id skipped: ${rule.id}`

                );


                continue;

            }


            seen.add(
                rule.id
            );


            unique.push(
                rule
            );

        }


        //----------------------------------------
        // Save raw database
        //----------------------------------------

        const file =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "progression.json"

            );


        fs.mkdirSync(

            path.dirname(
                file
            ),

            {
                recursive:
                    true
            }

        );


        fs.writeFileSync(

            file,

            JSON.stringify(

                unique,

                null,

                4

            ),

            "utf8"

        );


        //----------------------------------------
        // Report
        //----------------------------------------

        console.log();


        console.log(
            "Generated progression database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Progression records: ${unique.length}`
        );


        console.log();

    }





    /**
     * Normalize requirement object.
     *
     * Supports:
     * - badges
     * - key items
     * - story flags
     * - abilities
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
                Array.isArray(
                    requirement.badges
                )
                ?
                [
                    ...new Set(
                        requirement.badges
                    )
                ]
                :
                [],


            keyItems:
                Array.isArray(
                    requirement.keyItems
                )
                ?
                [
                    ...new Set(
                        requirement.keyItems
                    )
                ]
                :
                [],


            storyFlags:
                Array.isArray(
                    requirement.storyFlags
                )
                ?
                [
                    ...new Set(
                        requirement.storyFlags
                    )
                ]
                :
                [],


            abilities:
                Array.isArray(
                    requirement.abilities
                )
                ?
                [
                    ...new Set(
                        requirement.abilities
                    )
                ]
                :
                [],


            conditions:
                requirement.conditions
                &&
                typeof requirement.conditions ===
                    "object"
                ?
                {
                    ...requirement.conditions
                }
                :
                {}

        };

    }


}





module.exports =
    ProgressionGenerator;