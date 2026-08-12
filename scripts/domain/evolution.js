/**
 * Pokémon Companion
 * Evolution
 *
 * Represents a single Pokémon evolution.
 *
 * Responsibilities:
 * - Store evolution data.
 * - Represent one evolution relationship.
 *
 * Does NOT:
 * - Parse ROM data.
 * - Resolve reference databases.
 * - Perform evolution logic.
 */

"use strict";

class Evolution {

    /**
     * Create an Evolution.
     */
    constructor() {

        /**
         * Evolution method.
         *
         * @type {number}
         */
        this.method = 0;

        /**
         * Evolution parameter.
         *
         * Examples:
         * - Level
         * - Item ID
         * - Beauty value
         * *
         * @type {number}
         */
        this.parameter = 0;

        /**
         * Target species.
         *
         * @type {number}
         */
        this.targetSpecies = 0;

    }

}

module.exports = Evolution;