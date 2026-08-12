/**
 * Pokémon Companion
 * Pokémon Encounter Generator
 *
 * Generates raw encounter database.
 *
 * Responsibilities:
 * - Receive extracted encounters.
 * - Convert domain objects into JSON.
 * - Save raw database.
 *
 * Does NOT:
 * - Parse source files.
 * - Resolve references.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class PokemonEncounterGenerator {


    /**
     * Generate encounter database.
     *
     * @param {Array} encounters
     */
    generate(encounters) {


        const output =
            encounters.map(encounter => ({


                map:
                    encounter.map,


                baseLabel:
                    encounter.baseLabel,


                method:
                    encounter.method,


                encounterRate:
                    encounter.encounterRate,


                mons:
                    encounter.mons.map(mon => ({


                        species:
                            mon.species,


                        minLevel:
                            mon.minLevel,


                        maxLevel:
                            mon.maxLevel


                    }))


            }));



        const file = path.join(

            process.cwd(),

            "database",

            "raw",

            "firered",

            "pokemon-encounters.json"

        );



        fs.mkdirSync(

            path.dirname(file),

            {
                recursive: true
            }

        );



        fs.writeFileSync(

            file,

            JSON.stringify(
                output,
                null,
                4
            )

        );



        console.log();

        console.log(
            "Generated pokemon encounters database."
        );

        console.log(
            `Encounters: ${output.length}`
        );

        console.log();

    }


}


module.exports = PokemonEncounterGenerator;