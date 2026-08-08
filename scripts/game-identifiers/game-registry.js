/**
 * Pokémon Companion
 * Game Registry
 *
 * Stores all supported Pokémon games.
 *
 * Responsibilities:
 * - Store supported Game domain objects.
 * - Identify games from platform metadata.
 *
 * Does NOT:
 * - Read binary data.
 * - Open sources.
 * - Extract Pokémon data.
 */

"use strict";

const Game = require("../domain/game");
const Platform = require("../domain/platform");

class GameRegistry {

    /**
     * Supported Pokémon games.
     *
     * @type {Game[]}
     */
    static #games = [

        new Game({

            id: "firered",

            title: "Pokémon FireRed",

            generation: 3,

            platform: new Platform({

                id: "game-boy-advance",
                name: "Game Boy Advance",

            }),

            region: "Kanto",

            version: "FireRed",

        }),

    ];

    /**
     * Find a game by Nintendo game code.
     *
     * @param {string} gameCode
     * @returns {Game}
     */
    static findByGameCode(gameCode) {

        switch (gameCode) {

            case "BPRE":
                return this.#games[0];

            default:
                throw new Error(
                    `Unsupported game code '${gameCode}'.`
                );

        }

    }

}

module.exports = GameRegistry;