/**
 * Pokémon Companion
 * Wild Encounter Extractor
 *
 * Extracts wild Pokémon encounter data.
 *
 * Responsibilities:
 * - Read wild encounter JSON.
 * - Convert encounter entries.
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


        for (const group of data.wild_encounter_groups) {


            for (const entry of group.encounters) {


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


                    const encounter =
                        new PokemonEncounter({

                            map: entry.map,

                            baseLabel: entry.base_label,

                            method: method,

                            encounterRate:
                                entry[method].encounter_rate

                        });



                    encounter.mons =
                        entry[method].mons.map(mon =>

                            new EncounterMon({

                                species:
                                    mon.species,

                                minLevel:
                                    mon.min_level,

                                maxLevel:
                                    mon.max_level

                            })

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