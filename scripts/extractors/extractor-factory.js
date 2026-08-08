/**
 * Pokémon Companion
 * Extractor Factory
 *
 * Creates the correct extractor for a reader.
 */

"use strict";

const GameBoyAdvanceExtractor = require("./game-boy-advance/gba-extractor");

class ExtractorFactory {

    /**
     * Create an extractor.
     *
     * @param {Reader} reader
     * @returns {Extractor}
     */
    static create(reader) {

        switch (reader.source.platform.id) {

            case "game-boy":
                throw new Error(
                    "Game Boy Extractor has not been implemented yet."
                );

            case "game-boy-color":
                throw new Error(
                    "Game Boy Color Extractor has not been implemented yet."
                );

            case "game-boy-advance":
                return new GameBoyAdvanceExtractor(reader);

            case "nintendo-ds":
                throw new Error(
                    "Nintendo DS Extractor has not been implemented yet."
                );

            case "nintendo-3ds":
                throw new Error(
                    "Nintendo 3DS Extractor has not been implemented yet."
                );

            case "nintendo-switch":
                throw new Error(
                    "Nintendo Switch Extractor has not been implemented yet."
                );

            default:
                throw new Error(
                    `Unsupported platform '${reader.source.platform.id}'.`
                );

        }

    }

}

module.exports = ExtractorFactory;