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
 * - Store encounter slot rates.
 * - Store fishing rod groups.
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



        this.slotRates =
            Array.isArray(data.slotRates)
                ? [...data.slotRates]
                : [];



        this.rodGroups =
            data.rodGroups
                && typeof data.rodGroups === "object"
                && !Array.isArray(data.rodGroups)
                    ? {
                        ...data.rodGroups
                    }
                    : null;



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
     * Check if encounter has slot rates.
     *
     * @returns {boolean}
     */
    hasSlotRates() {


        return (
            this.slotRates.length > 0
        );


    }





    /**
     * Check if encounter has fishing rod groups.
     *
     * @returns {boolean}
     */
    hasRodGroups() {


        return (
            this.rodGroups !== null
        );


    }





    /**
     * Get fishing slots for a rod.
     *
     * @param {string} rod
     * @returns {number[]}
     */
    getRodSlots(rod) {


        if(
            !this.rodGroups
        ) {

            return [];

        }


        const slots =
            this.rodGroups[rod];


        return Array.isArray(slots)
            ? [...slots]
            : [];


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