/**
 * Pokémon Companion
 * Pokémon Evolution Extractor
 *
 * Extracts Pokémon evolution data from the
 * pokefirered decompilation.
 *
 * Responsibilities:
 * - Read the evolution table.
 * - Produce Pokémon Evolution domain objects.
 *
 * Does NOT:
 * - Build generated databases.
 * - Resolve references.
 * - Read ROM data.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PokemonEvolution = require("../../domain/pokemon-evolution");
const EvolutionParser = require("../../parsers/game-boy-advance/evolution-parser");

class PokemonEvolutionExtractor {

    /**
     * Extract every Pokémon evolution.
     *
     * @returns {PokemonEvolution[]}
     */
    extractAll() {

    const source = fs.readFileSync(
        path.join(
            process.cwd(),
            "..",
            "References",
            "pokefirered",
            "src",
            "data",
            "pokemon",
            "evolution.h"
        ),
        "utf8"
    );

        return this.parseEvolutionTable(source);

    }

    /**
     * Parse the evolution table.
     *
     * @param {string} source
     * @returns {PokemonEvolution[]}
     */
    parseEvolutionTable(source) {

        const evolutions = [];

        const lines = source.split("\n");

        let currentSpecies = null;

        let braceDepth = 0;

        let block = [];

        for (const line of lines) {

            //--------------------------------------------------
            // Find the start of a species block
            //--------------------------------------------------

            if (currentSpecies === null) {

                const match = line.match(
                    /\[(SPECIES_[A-Z0-9_]+)\]/
                );

                if (!match) {
                    continue;
                }

                currentSpecies = match[1];

                block = [];

                braceDepth = this.countBraces(line);

                block.push(line);

                // Single-line evolution
                if (braceDepth === 0) {

                    evolutions.push(
                        this.parseSpeciesBlock(
                            currentSpecies,
                            block.join("\n")
                        )
                    );

                    currentSpecies = null;

                }

                continue;

            }

            //--------------------------------------------------
            // Continue reading the current block
            //--------------------------------------------------

            block.push(line);

            braceDepth += this.countBraces(line);

            if (braceDepth === 0) {

                evolutions.push(
                    this.parseSpeciesBlock(
                        currentSpecies,
                        block.join("\n")
                    )
                );

                currentSpecies = null;

            }

        }

        return evolutions;

    }

    /**
     * Parse one Pokémon evolution block.
     *
     * @param {string} species
     * @param {string} block
     * @returns {PokemonEvolution}
     */
    parseSpeciesBlock(species, block) {

        const pokemonEvolution = new PokemonEvolution();

        pokemonEvolution.species = species;

        pokemonEvolution.evolutions = this.parseEvolutionEntries(
            block
        );

        return pokemonEvolution;

    }

    /**
     * Parse every evolution entry.
     *
     * @param {string} block
     * @returns {Evolution[]}
     */
    parseEvolutionEntries(block) {

        const parser = new EvolutionParser();

        const evolutions = [];

        const regex = /\{([^{}]+)\}/g;

        let match;

        while ((match = regex.exec(block)) !== null) {

            const entry = `{${match[1]}}`;

            evolutions.push(
                parser.parse(entry)
            );

        }

        return evolutions;

    }

    /**
     * Count opening and closing braces.
     *
     * @param {string} line
     * @returns {number}
     */
    countBraces(line) {

        let count = 0;

        for (const character of line) {

            if (character === "{") {
                count++;
            }

            if (character === "}") {
                count--;
            }

        }

        return count;

    }

}

module.exports = PokemonEvolutionExtractor;