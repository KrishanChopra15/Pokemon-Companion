/**
 * Pokémon Companion
 * Platform
 *
 * Represents a Nintendo platform.
 *
 * This is an immutable domain object.
 */

"use strict";

class Platform {

    /**
     * Create a Platform.
     *
     * @param {Object} options
     */
    constructor({
        id,
        name,
    }) {

        this.id = id;
        this.name = name;

        Object.freeze(this);

    }

}

module.exports = Platform;