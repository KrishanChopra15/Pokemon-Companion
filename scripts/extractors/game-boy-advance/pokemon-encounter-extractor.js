/**
 * Pokémon Companion
 * Wild Encounter Extractor
 *
 * Extracts wild Pokémon encounter data.
 *
 * Responsibilities:
 * - Read wild encounter JSON.
 * - Convert encounter entries.
 * - Preserve encounter slot rates.
 * - Preserve fishing rod groups.
 * - Create encounter objects.
 *
 * Does NOT:
 * - Build final database.
 * - Resolve species.
 */

"use strict";


const PokemonEncounter = require(
    "../../domain/pokemon-encounter"
);

const EncounterMon = require(
    "../../domain/encounter-mon"
);



class PokemonEncounterExtractor {


    /**
     * Extract encounters.
     *
     * @param {Object} data
     * @returns {PokemonEncounter[]}
     */
    extract(data) {


        const encounters = [];


        for (const group of data.wild_encounter_groups || []) {


            const fieldDefinitions =
                group.fields || [];


            for (const entry of group.encounters || []) {


                const methods = [
                    "land_mons",
                    "water_mons",
                    "rock_smash_mons",
                    "fishing_mons"
                ];


                for (const method of methods) {


                    if (!entry[method]) {

                        continue;

                    }


                    const methodData =
                        entry[method];


                    const fieldDefinition =
                        fieldDefinitions.find(

                            field =>
                                field.type === method

                        )
                        || null;



                    const encounter =
                        new PokemonEncounter({

                            map: entry.map,

                            baseLabel: entry.base_label,

                            method: method,

                            encounterRate:
                                methodData.encounter_rate

                        });



                    /*
                     * Preserve the source encounter slot
                     * probabilities.
                     *
                     * Example for FireRed fishing:
                     *
                     * [70, 30, 60, 20, 20,
                     *  40, 40, 15, 4, 1]
                     */
                    encounter.slotRates =
                        fieldDefinition
                        && Array.isArray(
                            fieldDefinition.encounter_rates
                        )
                            ? [
                                ...fieldDefinition.encounter_rates
                            ]
                            : [];



                    /*
                     * Preserve the FireRed fishing rod
                     * slot groups.
                     *
                     * Example:
                     *
                     * old_rod:
                     * [0, 1]
                     *
                     * good_rod:
                     * [2, 3, 4]
                     *
                     * super_rod:
                     * [5, 6, 7, 8, 9]
                     */
                    encounter.rodGroups =
                        method === "fishing_mons"
                        && fieldDefinition
                        && fieldDefinition.groups
                            ? {
                                ...fieldDefinition.groups
                            }
                            : null;



                    encounter.mons =
                        methodData.mons.map(

                            (mon, slotIndex) => {


                                const encounterMon =
                                    new EncounterMon({

                                        species:
                                            mon.species,

                                        minLevel:
                                            mon.min_level,

                                        maxLevel:
                                            mon.max_level

                                    });



                                /*
                                 * Preserve the original slot
                                 * position from the source.
                                 */
                                encounterMon.slotIndex =
                                    slotIndex;



                                /*
                                 * Preserve the individual
                                 * probability for this slot.
                                 *
                                 * This is separate from the
                                 * overall encounterRate for
                                 * the encounter table.
                                 */
                                encounterMon.slotEncounterRate =
                                    encounter.slotRates[
                                        slotIndex
                                    ] ?? null;



                                return encounterMon;


                            }

                        );



                    encounters.push(
                        encounter
                    );


                }


            }


        }


        return encounters;


    }

}


module.exports = PokemonEncounterExtractor;