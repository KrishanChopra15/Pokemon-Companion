/**
 * Pokémon Companion
 * Base Extractor
 *
 * Defines the common interface for every extractor.
 *
 * Responsibilities:
 * - Receive a reader.
 * - Extract structured domain data.
 * - Define the public extraction contract.
 *
 * Does NOT:
 * - Open sources.
 * - Read binary data directly.
 * - Build databases.
 * - Serve APIs.
 */

"use strict";

class Extractor {

    /**
     * Create an Extractor.
     *
     * @param {Reader} reader
     */
    constructor(reader) {

        this.reader = reader;

    }

    /**
     * Extract game information.
     *
     * @returns {Object}
     */
    extractGame() {

        throw new Error(
            "extractGame() must be implemented by the platform extractor."
        );

    }

    /**
     * Extract Pokémon species.
     *
     * @returns {Array}
     */
    extractPokemonSpecies() {

        throw new Error(
            "extractPokemonSpecies() must be implemented by the platform extractor."
        );

    }

    /**
     * Extract moves.
     *
     * @returns {Array}
     */
    extractMoves() {

        throw new Error(
            "extractMoves() must be implemented by the platform extractor."
        );

    }

    /**
     * Extract abilities.
     *
     * @returns {Array}
     */
    extractAbilities() {

        throw new Error(
            "extractAbilities() must be implemented by the platform extractor."
        );

    }

    /**
     * Extract items.
     *
     * @returns {Array}
     */
    extractItems() {

        throw new Error(
            "extractItems() must be implemented by the platform extractor."
        );

    }

}

module.exports = Extractor;