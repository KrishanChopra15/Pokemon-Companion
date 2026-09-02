/**
 * Pokémon Companion
 * Encounter Pokémon
 *
 * Represents one Pokémon available in an encounter slot.
 *
 * Responsibilities:
 * - Store Pokémon species.
 * - Store minimum level.
 * - Store maximum level.
 * - Store encounter slot index.
 * - Store encounter slot probability.
 * - Provide encounter information helpers.
 *
 * Does NOT:
 * - Resolve species.
 * - Read JSON.
 * - Parse ROM data.
 */

"use strict";


class EncounterMon {


    /**
     * Create an encounter Pokémon.
     *
     * @param {Object} data
     */
    constructor(data = {}) {


        this.species =
            data.species || null;


        this.minLevel =
            data.minLevel ?? 0;


        this.maxLevel =
            data.maxLevel ?? 0;


        this.slotIndex =
            data.slotIndex ?? null;


        this.slotEncounterRate =
            data.slotEncounterRate ?? null;


    }





    /**
     * Check if this is a valid encounter.
     *
     * @returns {boolean}
     */
    isValid() {


        return (

            this.species !== null

            &&

            this.minLevel > 0

            &&

            this.maxLevel > 0

        );


    }





    /**
     * Check if Pokémon has a fixed level.
     *
     * Example:
     * Unown Lv25
     *
     * @returns {boolean}
     */
    isFixedLevel() {


        return (

            this.minLevel ===
            this.maxLevel

        );


    }





    /**
     * Check if this encounter has a slot.
     *
     * @returns {boolean}
     */
    hasSlot() {


        return (

            this.slotIndex !== null

        );


    }





    /**
     * Check if this encounter has a slot encounter rate.
     *
     * @returns {boolean}
     */
    hasSlotEncounterRate() {


        return (

            this.slotEncounterRate !== null

        );


    }





    /**
     * Get readable level range.
     *
     * Examples:
     * "5"
     * "3-5"
     *
     * @returns {string}
     */
    getLevelRange() {


        if(
            this.isFixedLevel()
        ) {


            return String(
                this.minLevel
            );


        }



        return `${this.minLevel}-${this.maxLevel}`;


    }


}


module.exports = EncounterMon;