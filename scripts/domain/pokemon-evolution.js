/**
 * Pokémon Companion
 * Pokémon Evolution
 *
 * Represents the evolution data for a single Pokémon species.
 *
 * Responsibilities:
 * - Store the species identifier.
 * - Store every possible evolution.
 *
 * Does NOT:
 * - Parse source files.
 * - Resolve references.
 * - Perform evolution logic.
 */

"use strict";

class PokemonEvolution {

    /**
     * Create Pokémon Evolution data.
     */
    constructor() {

        /**
         * Pokémon species.
         *
         * Example:
         * SPECIES_BULBASAUR
         *
         * @type {string}
         */
        this.species = "";

        /**
         * Evolutions.
         *
         * @type {Evolution[]}
         */
        this.evolutions = [];

    }

}

module.exports = PokemonEvolution;