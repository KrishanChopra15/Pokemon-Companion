/**
 * Pokémon Companion
 * Species Signatures
 *
 * Binary signatures used to locate the Pokémon species table
 * inside Game Boy Advance ROMs.
 *
 * These signatures are derived from the verified ROM data,
 * not from pret source files.
 *
 * Responsibilities:
 * - Provide unique byte patterns.
 * - Help locate binary tables.
 *
 * Does NOT:
 * - Scan ROMs.
 * - Parse Pokémon.
 */

"use strict";

class SpeciesSignatures {

    /**
     * Bulbasaur.
     *
     * First 10 bytes of SpeciesInfo.
     *
     * HP          45
     * Attack      49
     * Defense     49
     * Speed       45
     * Sp. Attack  65
     * Sp. Defense 65
     * Type1       Grass (12)
     * Type2       Poison (3)
     * Catch Rate  45
     * Exp Yield   64
     */
    static BULBASAUR = Buffer.from([
        45,
        49,
        49,
        45,
        65,
        65,
        12,
        3,
        45,
        64
    ]);

}

module.exports = SpeciesSignatures;