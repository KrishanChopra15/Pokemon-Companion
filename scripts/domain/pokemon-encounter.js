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


class PokemonEncounter {


    /**
     * Create a Pokémon encounter.
     *
     * @param {Object} data
     */
    constructor(data = {}) {


        this.map = data.map || null;

        this.baseLabel = data.baseLabel || null;

        this.method = data.method || null;

        this.encounterRate =
            data.encounterRate || 0;


        this.mons =
            data.mons || [];


    }


}


module.exports = PokemonEncounter;