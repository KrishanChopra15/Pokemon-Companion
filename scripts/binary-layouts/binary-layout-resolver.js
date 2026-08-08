/**
 * Pokémon Companion
 * Binary Layout Resolver
 *
 * Resolves the Binary Layout for an identified game.
 *
 * Responsibilities:
 * - Resolve the appropriate Binary Layout.
 *
 * Does NOT:
 * - Identify games.
 * - Read binary data.
 * - Extract datasets.
 * - Construct domain objects.
 */

"use strict";

const FireRedBinaryLayout = require("./game-boy-advance/firered-binary-layout");

class BinaryLayoutResolver {

    /**
     * Resolve the Binary Layout for a game.
     *
     * @param {Game} game
     * @returns {BinaryLayout}
     */
    static resolve(game) {

        switch (game.id) {

            case "firered":
                return FireRedBinaryLayout;

            default:
                throw new Error(
                    `No Binary Layout registered for '${game.id}'.`
                );

        }

    }

}

module.exports = BinaryLayoutResolver;