/**
 * Pokémon Companion
 * Evolution Parser
 *
 * Parses a single evolution entry from the Pokémon
 * evolution table.
 *
 * Responsibilities:
 * - Parse one evolution entry.
 * - Produce an Evolution domain object.
 *
 * Does NOT:
 * - Read files.
 * - Iterate species.
 * - Resolve references.
 */

"use strict";

const Evolution = require("../../domain/evolution");

class EvolutionParser {

    /**
     * Parse one evolution entry.
     *
     * Example:
     * {EVO_LEVEL, 16, SPECIES_IVYSAUR}
     *
     * @param {string} entry
     * @returns {Evolution}
     */
    parse(entry) {

        const evolution = new Evolution();

        const regex = /^\s*\{\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^\}]+)\s*\}\s*$/;

        const match = entry.match(regex);

        if (!match) {

            throw new Error(
                `Invalid evolution entry: ${entry}`
            );

        }

        evolution.method = match[1].trim();

        evolution.parameter = match[2].trim();

        evolution.targetSpecies = match[3].trim();

        return evolution;

    }

}

module.exports = EvolutionParser;