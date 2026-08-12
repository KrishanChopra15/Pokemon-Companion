/**
 * Pokémon Companion
 * Game Boy Advance Pokémon Move Parser
 *
 * Parses a Pokémon move from a Game Boy Advance ROM.
 *
 * Responsibilities:
 * - Read the binary BattleMove structure.
 * - Convert raw bytes into a PokemonMove domain object.
 *
 * Does NOT:
 * - Locate the move table.
 * - Open ROMs.
 * - Extract multiple moves.
 */

"use strict";

const PokemonMove = require("../../domain/pokemon-move");

class PokemonMoveParser {

    /**
     * Parse a Pokémon move.
     *
     * BattleMove structure:
     *
     * 0x00 effect
     * 0x01 power
     * 0x02 type
     * 0x03 accuracy
     * 0x04 pp
     * 0x05 secondaryEffectChance
     * 0x06 target
     * 0x07 priority
     * 0x08 flags
     *
     * Total size: 9 bytes
     *
     * @param {BinaryReader} reader
     * @param {number} offset
     * @param {Object} metadata
     * @returns {PokemonMove}
     */
    parse(reader, offset, metadata) {

        return new PokemonMove({

            id: metadata.id,

            name: metadata.name,

            effect: reader.readUInt8(offset + 0x00),

            power: reader.readUInt8(offset + 0x01),

            type: reader.readUInt8(offset + 0x02),

            accuracy: reader.readUInt8(offset + 0x03),

            pp: reader.readUInt8(offset + 0x04),

            secondaryEffectChance:
                reader.readUInt8(offset + 0x05),

            target:
                reader.readUInt8(offset + 0x06),

            priority:
                reader.readUInt8(offset + 0x07) > 127
                    ? reader.readUInt8(offset + 0x07) - 256
                    : reader.readUInt8(offset + 0x07),

            flags:
                reader.readUInt8(offset + 0x08)

        });

    }

}

module.exports = PokemonMoveParser;