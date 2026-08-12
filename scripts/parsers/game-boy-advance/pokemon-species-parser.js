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
    parse(
        reader,
        offset,
        metadata
    ) {

        const evYield = reader.readUInt16(offset + 0x0A);

        const bodyColorByte = reader.readUInt8(offset + 0x19);

        return new PokemonSpecies({
        
            id: metadata.id,

            nationalDexNumber:
                metadata.nationalDexNumber,

            name: null,
            
            generation:
                metadata.generation,

        
            baseHP: reader.readUInt8(offset + 0),
            baseAttack: reader.readUInt8(offset + 1),
            baseDefense: reader.readUInt8(offset + 2),
            baseSpeed: reader.readUInt8(offset + 3),
            baseSpAttack: reader.readUInt8(offset + 4),
            baseSpDefense: reader.readUInt8(offset + 5),
        
            type1: reader.readUInt8(offset + 6),
            type2: reader.readUInt8(offset + 7),
        
            catchRate: reader.readUInt8(offset + 8),
            expYield: reader.readUInt8(offset + 9),
        
            evYieldHP:        evYield        & 0b11,
            evYieldAttack:   (evYield >> 2) & 0b11,
            evYieldDefense:  (evYield >> 4) & 0b11,
            evYieldSpeed:    (evYield >> 6) & 0b11,
            evYieldSpAttack: (evYield >> 8) & 0b11,
            evYieldSpDefense:(evYield >> 10) & 0b11,

            itemCommon: reader.readUInt16(offset + 0x0C),
            itemRare: reader.readUInt16(offset + 0x0E),

            genderRatio: reader.readUInt8(offset + 0x10),
            eggCycles: reader.readUInt8(offset + 0x11),
            friendship: reader.readUInt8(offset + 0x12),
            growthRate: reader.readUInt8(offset + 0x13),

            eggGroup1: reader.readUInt8(offset + 0x14),
            eggGroup2: reader.readUInt8(offset + 0x15),

            ability1: reader.readUInt8(offset + 0x16),
            ability2: reader.readUInt8(offset + 0x17),

            safariZoneFleeRate: reader.readUInt8(offset + 0x18),

            bodyColor: bodyColorByte & 0x7F,
            noFlip: (bodyColorByte >> 7) & 0x01

        });

        return species;

    }

}

module.exports = PokemonSpeciesParser;