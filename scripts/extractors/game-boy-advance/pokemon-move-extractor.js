/**
 * Pokémon Companion
 * Game Boy Advance Pokémon Move Extractor
 *
 * Extracts Pokémon moves from Game Boy Advance games.
 *
 * Responsibilities:
 * - Extract the complete Pokémon move dataset.
 * - Produce Pokémon Move domain objects.
 *
 * Does NOT:
 * - Open ROMs.
 * - Identify games.
 * - Read platform metadata.
 * - Extract unrelated datasets.
 */

"use strict";

const PokemonMoveParser = require(
    "../../parsers/game-boy-advance/pokemon-move-parser"
);

class PokemonMoveExtractor {

    /**
     * Create a Pokémon Move Extractor.
     *
     * @param {GameBoyAdvanceReader} reader
     * @param {Game} game
     * @param {BinaryLayout} layout
     */
    constructor(reader, game, layout) {

        this.reader = reader;
        this.game = game;
        this.layout = layout;

        this.parser = new PokemonMoveParser();

    }

    /**
     * Extract all Pokémon moves.
     *
     * @returns {PokemonMove[]}
     */
    extractAll() {

        const moves = [];

        const count = this.layout.moves.count;

        for (let index = 0; index < count; index++) {

            moves.push(
                this.readMove(index)
            );

        }

        return moves;

    }

    /**
     * Read a single Pokémon move.
     *
     * @param {number} index
     * @returns {PokemonMove}
     */
    readMove(index) {
    
        const tableOffset =
            this.layout.moves.offset;
    
        const entrySize =
            this.layout.moves.entrySize;
    
    
        const offset =
            tableOffset + (index * entrySize);
    
    
        const metadata = {
            id: index,
            name: null
        };
    
    
        return this.parser.parse(
            this.reader.binaryReader,
            offset,
            metadata
        );
    
    }

}

module.exports = PokemonMoveExtractor;