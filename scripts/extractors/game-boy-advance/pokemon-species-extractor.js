/**
 * Pokémon Companion
 * Game Boy Advance Pokémon Species Extractor
 *
 * Extracts Pokémon species from Game Boy Advance games.
 *
 * Responsibilities:
 * - Extract the complete Pokémon species dataset.
 * - Produce Pokémon Species domain objects.
 *
 * Does NOT:
 * - Open ROMs.
 * - Identify games.
 * - Read platform metadata.
 * - Extract unrelated datasets.
 */

"use strict";

const PokemonSpecies = require("../../domain/pokemon-species");

const PokemonSpeciesParser = require("../../parsers/game-boy-advance/pokemon-species-parser");

class PokemonSpeciesExtractor {

    /**
     * Create a Pokémon Species Extractor.
     *
     * @param {GameBoyAdvanceReader} reader
     * @param {Game} game
     * @param {BinaryLayout} layout
     */
    constructor(reader, game, layout) {

        this.reader = reader;
        this.game = game;
        this.layout = layout;

    }

    /**
     * Extract all Pokémon species.
     *
     * @returns {Buffer[]}
     */
    extractAll() {

        const species = [];

        species.push(
            this.readSpecies(0)
        );

        return species;

    }

    /**
     * Read a single Pokémon species.
     *
     * @param {number} index
     * @returns {PokemonSpecies}
     */
    readSpecies(index) {
    
        const tableOffset = this.layout.pokemonSpecies.offset;
    
        const entrySize = this.layout.pokemonSpecies.entrySize;
    
        const offset = tableOffset + (index * entrySize);
    
        const parser = new PokemonSpeciesParser();
    
        return parser.parse(
            this.reader.binaryReader,
            offset
        );
    
    }

    /**
     * Parse Pokémon species data.
     *
     * @param {Buffer} data
     * @returns {PokemonSpecies}
     */
    parseSpecies(data) {

        throw new Error(
            "Pokémon species parsing has not yet been implemented."
        );

    }

}

module.exports = PokemonSpeciesExtractor;