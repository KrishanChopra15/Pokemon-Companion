/**
 * Pokémon Companion
 * Pokémon Encounter Builder
 *
 * Builds generated Pokémon encounter database.
 *
 * Responsibilities:
 * - Load raw encounter database.
 * - Resolve Pokémon species.
 * - Normalize encounter data.
 * - Preserve encounter slot data.
 * - Preserve fishing rod groups.
 * - Save generated encounter database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract source data.
 */

"use strict";


const Builder =
    require("./builder");


const ReferenceRegistry =
    require("./reference-registry");





class PokemonEncounterBuilder extends Builder {



    /**
     * Remove duplicate encounter slots.
     *
     * @param {Array} mons
     * @returns {Array}
     */
    normalizeMons(mons = []) {


        const unique =
            new Map();



        for (const mon of mons) {



            if(
                !mon.species
            ){

                continue;

            }



            const key =
                `${mon.species}-${mon.minLevel}-${mon.maxLevel}-${mon.slotIndex ?? "null"}-${mon.slotEncounterRate ?? "null"}`;



            if(
                !unique.has(key)
            ){


                unique.set(
                    key,
                    mon
                );


            }


        }



        return [
            ...unique.values()
        ];


    }





    /**
     * Build generated encounter database.
     *
     * @param {string} game
     */
    build(game) {



        //----------------------------------------
        // Load databases
        //----------------------------------------


        const rawEncounters =
            this.loadRawDatabase(
                game,
                "pokemon-encounters"
            );



        const references =
            new ReferenceRegistry();





        //----------------------------------------
        // Build
        //----------------------------------------


        const generatedEncounters =

            rawEncounters.map(encounter => {



                const mons =
                    this.normalizeMons(
                        encounter.mons
                    );



                return {



                    map:
                        encounter.map,



                    baseLabel:
                        encounter.baseLabel,



                    method:
                        encounter.method,



                    encounterRate:
                        encounter.encounterRate,



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

                        mons.map(mon => {



                            const species =

                                references.speciesNames
                                    .getByConstant(
                                        mon.species
                                    );



                            if(!species){


                                console.warn(

                                    `Unknown species: ${mon.species}`

                                );


                                return null;


                            }




                            return {



                                species:{


                                    id:
                                        species.id,


                                    name:
                                        species.name,


                                    constant:
                                        species.constant


                                },



                                slotIndex:
                                    mon.slotIndex ?? null,



                                slotEncounterRate:
                                    mon.slotEncounterRate ?? null,



                                minLevel:
                                    mon.minLevel,



                                maxLevel:
                                    mon.maxLevel



                            };


                        })
                        .filter(Boolean)


                };


            });







        //----------------------------------------
        // Save
        //----------------------------------------


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





module.exports =
    PokemonEncounterBuilder;