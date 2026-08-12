/**
 * Pokémon Companion
 * Pokémon Learnset Domain
 *
 * Represents the complete level-up learnset
 * of one Pokémon species.
 *
 * Responsibilities:
 * - Store species identifier.
 * - Store learned moves.
 *
 * Does NOT:
 * - Read files.
 * - Parse source code.
 * - Resolve references.
 */

"use strict";

class PokemonLearnset {

    /**
     * Create a Pokémon Learnset.
     *
     * @param {Object} data
     */
    constructor(data = {}) {


        /**
         * Species constant.
         *
         * Example:
         * Bulbasaur
         */
        this.species = data.species || null;


        /**
         * List of learned moves.
         */
        this.moves = data.moves || [];


    }

}

module.exports = PokemonLearnset;