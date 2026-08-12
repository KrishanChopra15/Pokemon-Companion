/**
 * Pokémon Companion
 * Learnset Move Domain
 *
 * Represents one level-up learnset entry.
 *
 * Responsibilities:
 * - Store the level a Pokémon learns a move.
 * - Store the move constant.
 *
 * Does NOT:
 * - Read files.
 * - Parse source code.
 * - Resolve move references.
 */

"use strict";

class LearnsetMove {

    /**
     * Create a Learnset Move.
     *
     * @param {Object} data
     */
    constructor(data = {}) {

        /**
         * Level learned.
         */
        this.level = data.level || 0;


        /**
         * Move constant.
         *
         * Example:
         * MOVE_TACKLE
         */
        this.move = data.move || null;

    }

}

module.exports = LearnsetMove;