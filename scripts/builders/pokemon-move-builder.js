/**
 * Pokémon Companion
 * Pokémon Move Builder
 *
 * Builds the generated Pokémon move database by combining
 * raw extraction data with reference databases.
 *
 * Responsibilities:
 * - Read raw Pokémon move data.
 * - Read reference move names.
 * - Merge datasets.
 * - Write the generated Pokémon move database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Parse binary data.
 * - Extract moves.
 */

"use strict";

const Builder = require("./builder");
const ReferenceRegistry = require("./reference-registry");

class PokemonMoveBuilder extends Builder {

    /**
     * Build the generated Pokémon move database.
     *
     * @param {string} game
     */
    build(game) {

        const rawMoves = this.loadRawDatabase(
            game,
            "pokemon-moves"
        );

        const references = new ReferenceRegistry();

        const generatedMoves = rawMoves.map(move => {

            const reference = references.moveNames.get(
                move.id
            );

            return {

                ...move,

                name: reference
                    ? reference.name
                    : null,

                constant: reference
                    ? reference.constant
                    : null

            };

        });

        this.saveGeneratedDatabase(
            game,
            "pokemon-moves",
            generatedMoves
        );

        console.log();

        console.log(
            "Generated Pokémon moves database."
        );

        console.log(
            `Moves: ${generatedMoves.length}`
        );

        console.log();

    }

}

module.exports = PokemonMoveBuilder;