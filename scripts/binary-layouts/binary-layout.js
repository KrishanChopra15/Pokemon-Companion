/**
 * Pokémon Companion
 * Binary Layout
 *
 * Describes the organization of a game's binary.
 *
 * Responsibilities:
 * - Describe binary structures.
 * - Store binary layout definitions.
 *
 * Does NOT:
 * - Read binary data.
 * - Identify games.
 * - Extract datasets.
 * - Construct domain objects.
 */

"use strict";

class BinaryLayout {

    /**
     * Create a Binary Layout.
     *
     * @param {Object} definition
     */
    constructor(definition) {

        Object.assign(this, definition);

        Object.freeze(this);

    }

}

module.exports = BinaryLayout;