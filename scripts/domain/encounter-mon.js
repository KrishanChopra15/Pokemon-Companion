/**
 * Pokémon Companion
 * Encounter Pokémon
 *
 * Represents one Pokémon available in an encounter.
 *
 * Responsibilities:
 * - Store Pokémon species.
 * - Store minimum level.
 * - Store maximum level.
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
            data.minLevel || 0;


        this.maxLevel =
            data.maxLevel || 0;


    }


}


module.exports = EncounterMon;