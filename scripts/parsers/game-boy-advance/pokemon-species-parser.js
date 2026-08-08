/**
 * Pokémon Companion
 * Game Boy Advance Pokémon Species Parser
 *
 * Converts raw Pokémon species binary data into domain objects.
 *
 * Responsibilities:
 * - Interpret one Pokémon species entry.
 * - Produce a PokémonSpecies domain object.
 *
 * Does NOT:
 * - Read ROMs.
 * - Calculate offsets.
 * - Extract multiple species.
 */

"use strict";

const PokemonSpecies = require("../../domain/pokemon-species");

class PokemonSpeciesParser {

    /**
     * Parse one Pokémon species.
     *
     * @param {BinaryReader} reader
     * @param {number} offset
     * @returns {PokemonSpecies}
     */
    parse(reader, offset) {

        return new PokemonSpecies({

            id: null, 
            nationalDexNumber: null,
            name: null,
            generation: null,

            baseHP: reader.readUInt8(offset + 0),
            baseAttack: reader.readUInt8(offset + 1),
            baseDefense: reader.readUInt8(offset + 2),
            baseSpeed: reader.readUInt8(offset + 3),
            baseSpAttack: reader.readUInt8(offset + 4),
            baseSpDefense: reader.readUInt8(offset + 5)

        });

    }

}

module.exports = PokemonSpeciesParser;