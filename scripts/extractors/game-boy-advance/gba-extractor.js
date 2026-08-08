/**
 * Pokémon Companion
 * Game Boy Advance Extractor
 *
 * Extracts Pokémon domain data from Game Boy Advance games.
 *
 * Responsibilities:
 * - Extract Pokémon data.
 * - Interpret Game Boy Advance metadata.
 * - Produce domain objects.
 *
 * Does NOT:
 * - Open ROMs.
 * - Read binary files directly.
 * - Build databases.
 */

"use strict";

const Extractor = require("../extractor");

const GameRegistry = require("../../game-identifiers/game-registry");

const BinaryLayoutResolver = require("../../binary-layouts/binary-layout-resolver");

const PokemonSpeciesExtractor = require("./pokemon-species-extractor");

class GameBoyAdvanceExtractor extends Extractor {
    
    /**
     * Create a Game Boy Advance Extractor.
     *
     * @param {GameBoyAdvanceReader} reader
     */
    constructor(reader) {

        super(reader);

        this.game = this.extractGame();

        this.layout = BinaryLayoutResolver.resolve(this.game);

    }

    /**
     * Extract game information.
     *
     * @returns {Game}
     */
    extractGame() {

        const metadata = this.reader.readMetadata();

        return GameRegistry.findByGameCode(metadata.gameCode);

    }

    /**
     * Extract Pokémon species.
     *
     * @returns {PokemonSpecies[]}
     */
    extractPokemonSpecies() {

        const game = this.extractGame();

        const layout = BinaryLayoutResolver.resolve(game);

        const speciesExtractor = new PokemonSpeciesExtractor(
            this.reader,
            game,
            layout
        );

        return speciesExtractor.extractAll();

    }

    /**
     * Extract moves.
     */
    extractMoves() {

        throw new Error("Not implemented.");

    }

    /**
     * Extract abilities.
     */
    extractAbilities() {

        throw new Error("Not implemented.");

    }

    /**
     * Extract items.
     */
    extractItems() {

        throw new Error("Not implemented.");

    }

}

module.exports = GameBoyAdvanceExtractor;