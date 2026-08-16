/**
 * Pokémon Companion
 * Pokémon Encounter
 *
 * Represents a Pokémon encounter location.
 *
 * Responsibilities:
 * - Store encounter map information.
 * - Store encounter method.
 * - Store encounter rate.
 * - Store possible Pokémon.
 *
 * Does NOT:
 * - Read JSON.
 * - Parse ROM data.
 * - Resolve species.
 */

"use strict";


const EncounterMon =
    require("./encounter-mon");



class PokemonEncounter {


    /**
     * Create a Pokémon encounter.
     *
     * @param {Object} data
     */
    constructor(data = {}) {


        this.map =
            data.map || null;



        this.baseLabel =
            data.baseLabel || null;



        this.method =
            data.method || null;



        this.encounterRate =
            data.encounterRate ?? 0;



        this.mons =
            (data.mons || [])
                .map(
                    mon =>
                        mon instanceof EncounterMon
                            ? mon
                            : new EncounterMon(mon)
                );


    }





    /**
     * Add encounter Pokémon.
     *
     * @param {EncounterMon} mon
     */
    addMon(mon) {


        if(
            !(mon instanceof EncounterMon)
        ) {

            mon =
                new EncounterMon(mon);

        }


        this.mons.push(
            mon
        );


    }





    /**
     * Get number of possible Pokémon.
     *
     * @returns {number}
     */
    getMonCount() {


        return this.mons.length;


    }





    /**
     * Check if encounter has Pokémon.
     *
     * @returns {boolean}
     */
    hasMons() {


        return (
            this.mons.length > 0
        );


    }





    /**
     * Check if Pokémon exists.
     *
     * @param {string} species
     * @returns {boolean}
     */
    hasSpecies(species) {


        return this.mons.some(

            mon =>
                mon.species === species

        );


    }





    /**
     * Get Pokémon by species.
     *
     * @param {string} species
     * @returns {EncounterMon|null}
     */
    getSpecies(species) {


        return (

            this.mons.find(

                mon =>
                    mon.species === species

            )

            ||

            null

        );


    }





    /**
     * Check if encounter is valid.
     *
     * @returns {boolean}
     */
    isValid() {


        return (

            this.map !== null

            &&

            this.method !== null

            &&

            this.hasMons()

        );


    }


}


module.exports =
    PokemonEncounter;