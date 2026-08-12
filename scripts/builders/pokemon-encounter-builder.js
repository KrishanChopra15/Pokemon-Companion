/**
 * Pokémon Companion
 * Pokémon Encounter Builder
 *
 * Builds generated Pokémon encounter database.
 *
 * Responsibilities:
 * - Load raw encounter database.
 * - Resolve Pokémon species.
 * - Save generated encounter database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract source data.
 */

"use strict";

const Builder = require("./builder");
const ReferenceRegistry = require("./reference-registry");


class PokemonEncounterBuilder extends Builder {


    /**
     * Build generated encounter database.
     *
     * @param {string} game
     */
    build(game) {


        //------------------------------------------------------
        // Load databases
        //------------------------------------------------------

        const rawEncounters =
            this.loadRawDatabase(
                game,
                "pokemon-encounters"
            );


        const references =
            new ReferenceRegistry();



        //------------------------------------------------------
        // Build
        //------------------------------------------------------

        const generatedEncounters =
            rawEncounters.map(encounter => {


                return {


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
                                references.speciesNames.getByConstant(
                                    mon.species
                                ),


                            minLevel:
                                mon.minLevel,


                            maxLevel:
                                mon.maxLevel


                        }))


                };


            });



        //------------------------------------------------------
        // Save
        //------------------------------------------------------

        this.saveGeneratedDatabase(

            game,

            "pokemon-encounters",

            generatedEncounters

        );


        console.log();

        console.log(
            "Generated Pokémon encounter database."
        );

        console.log(
            `Encounters: ${generatedEncounters.length}`
        );

        console.log();

    }


}


module.exports = PokemonEncounterBuilder;