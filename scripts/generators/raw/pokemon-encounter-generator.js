/**
 * Pokémon Companion
 * Pokémon Encounter Generator
 *
 * Generates raw encounter database.
 *
 * Responsibilities:
 * - Receive extracted encounters.
 * - Convert domain objects into JSON.
 * - Preserve encounter slot data.
 * - Preserve fishing rod groups.
 * - Save raw database.
 *
 * Does NOT:
 * - Parse source files.
 * - Resolve references.
 * - Modify encounter data.
 */

"use strict";


const fs = require("fs");
const path = require("path");



class PokemonEncounterGenerator {



    /**
     * Generate encounter database.
     *
     * @param {Array} encounters
     * @param {string} game
     */
    generate(
        encounters = [],
        game = "firered"
    ) {



        const output =

            encounters.map(encounter => ({



                map:
                    encounter.map || null,



                baseLabel:
                    encounter.baseLabel || null,



                method:
                    encounter.method || null,



                encounterRate:
                    encounter.encounterRate ?? 0,



                slotRates:
                    Array.isArray(
                        encounter.slotRates
                    )
                        ? [
                            ...encounter.slotRates
                        ]
                        : [],



                rodGroups:
                    encounter.rodGroups
                        && typeof encounter.rodGroups === "object"
                        && !Array.isArray(
                            encounter.rodGroups
                        )
                            ? {
                                ...encounter.rodGroups
                            }
                            : null,



                mons:

                    (encounter.mons || [])
                        .map(mon => ({



                            species:
                                mon.species || null,



                            slotIndex:
                                mon.slotIndex ?? null,



                            slotEncounterRate:
                                mon.slotEncounterRate ?? null,



                            minLevel:
                                mon.minLevel ?? 0,



                            maxLevel:
                                mon.maxLevel ?? 0



                        }))



            }));





        const file =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "pokemon-encounters.json"

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
            "Generated pokemon encounters database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Encounter groups: ${output.length}`
        );


        console.log();

    }


}



module.exports =
    PokemonEncounterGenerator;