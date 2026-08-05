/**
 * Pokémon Companion
 * Reader Factory
 *
 * Creates the appropriate reader for a discovered source.
 *
 * Responsibilities:
 * - Select the correct reader implementation.
 * - Construct the reader.
 *
 * Does NOT:
 * - Open readers.
 * - Read source data.
 * - Inspect file extensions.
 * - Discover sources.
 */

"use strict";

// Platform readers will be required here as they are implemented.
// const GameBoyAdvanceReader = require("./game-boy-advance/gba-reader");

const GameBoyAdvanceReader = require("./game-boy-advance/gba-reader");

class ReaderFactory {

    /**
     * Create a reader for the given source.
     *
     * @param {Source} source
     * @returns {Reader}
     */
    static create(source) {

        switch (source.platform.id) {

            case "game-boy":
                throw new Error("Game Boy Reader has not been implemented yet.");

            case "game-boy-color":
                throw new Error("Game Boy Color Reader has not been implemented yet.");

            case "game-boy-advance":
                return new GameBoyAdvanceReader(source);

            case "nintendo-ds":
                throw new Error("Nintendo DS Reader has not been implemented yet.");

            case "nintendo-3ds":
                throw new Error("Nintendo 3DS Reader has not been implemented yet.");

            case "nintendo-switch":
                throw new Error("Nintendo Switch Reader has not been implemented yet.");

            case "event-distributions":
                throw new Error("Event Distribution Reader has not been implemented yet.");

            default:
                throw new Error(
                    `No reader is registered for platform '${source.platform.id}'.`
                );

        }

    }

}

module.exports = ReaderFactory;