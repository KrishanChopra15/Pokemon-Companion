/**
 * Pokémon Companion
 * Game
 *
 * Represents a Pokémon game.
 *
 * This is an immutable domain object.
 */

"use strict";

class Game {

    /**
     * Create a Game.
     *
     * @param {Object} options
     */
    constructor({

        id,
        title,
        generation,
        platform,
        region,
        version,

    }) {

        this.id = id;
        this.title = title;
        this.generation = generation;
        this.platform = platform;
        this.region = region;
        this.version = version;

        Object.freeze(this);

    }

}

module.exports = Game;