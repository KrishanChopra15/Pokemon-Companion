/**
 * Pokémon Companion
 * Species Name Parser
 *
 * Parses Pokémon species names from the FireRed reference source.
 *
 * Responsibilities:
 * - Parse species_names.h.
 * - Extract Pokémon species constants.
 * - Extract Pokémon names.
 * - Produce structured objects.
 *
 * Does NOT:
 * - Read files.
 * - Write JSON.
 * - Understand ROMs.
 */

"use strict";

class SpeciesNameParser {

    /**
     * Parse Pokémon species names.
     *
     * @param {string} source
     * @returns {Object[]}
     */
    parse(source) {

        const species = [];

        const regex =
            /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*_\("([^"]*)"\)/g;

        let match;

        while ((match = regex.exec(source)) !== null) {

            species.push({

                id: species.length,

                constant: match[1],

                name: match[2]

            });

        }

        return species;

    }

}

module.exports = SpeciesNameParser;