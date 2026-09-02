/**
 * Pokémon Companion
 * Progression Domain Object
 *
 * Represents a progression requirement or unlock.
 *
 * Responsibilities:
 * - Store progression identifier.
 * - Store related location.
 * - Store progression type.
 * - Store requirements.
 * - Store unlocked content.
 *
 * Does NOT:
 * - Read JSON.
 * - Parse ROM data.
 * - Calculate player progress.
 */

"use strict";


class Progression {


    /**
     * Create progression record.
     *
     * @param {Object} data
     */
    constructor(data = {}) {


        this.id =
            data.id || null;



        this.location =
            data.location || null;



        this.eventId =
            data.eventId || null;



        this.type =
            data.type || null;



        this.requirement =
            data.requirement || null;



        this.unlocks =
            data.unlocks || [];


    }





    /**
     * Add unlocked content.
     *
     * @param {string} unlock
     */
    addUnlock(unlock) {


        this.unlocks.push(
            unlock
        );


    }





    /**
     * Check if progression has requirement.
     *
     * @returns {boolean}
     */
    hasRequirement() {


        return this.requirement !== null;


    }





    /**
     * Get unlock count.
     *
     * @returns {number}
     */
    getUnlockCount() {


        return this.unlocks.length;


    }


}


module.exports = Progression;