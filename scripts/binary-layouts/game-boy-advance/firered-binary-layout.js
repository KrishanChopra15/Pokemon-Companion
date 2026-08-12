/**
 * Pokémon Companion
 * FireRed Binary Layout
 *
 * Describes the binary layout of Pokémon FireRed.
 *
 * Verified ROM:
 * pokefirered build
 *
 * Source:
 * pret/pokefirered decompilation
 *
 * SHA-1:
 * 41cb23d8dccc8ebd7c649cd8fbb58eeace6e2fdc
 */

"use strict";

const BinaryLayout = require("../binary-layout");

module.exports = new BinaryLayout({

    /**
     * Pokémon species data.
     *
     * Verified by direct ROM inspection.
     *
     * The first entry begins with Bulbasaur:
     *
     * HP          45
     * Attack      49
     * Defense     49
     * Speed       45
     * Sp. Attack  65
     * Sp. Defense 65
     */
    pokemonSpecies: {

        /**
         * File offset of the first SpeciesInfo entry
         * (Bulbasaur).
         *
         * Source:
         * gSpeciesInfo
         *
         * GBA address:
         * 0x08254784
         *
         * ROM offset:
         * 0x254784
         */
        offset: 0x254784,

        /**
         * sizeof(struct SpeciesInfo)
         */
        entrySize: 28,

        /**
         * National Dex count in FireRed
         */
        count: 386

    },

    /**
     * Pokémon move data.
     *
     * Verified by direct ROM inspection.
     *
     * gBattleMoves begins at ROM offset 0x250C04.
     *
     * Each ROM entry occupies 12 bytes:
     * 9 bytes of BattleMove data
     * followed by 3 bytes of padding.
     */
    moves: {
    
        /**
         * Pokémon move data.
         *
         * Verified:
         * gBattleMoves
         *
         * GBA address:
         * 0x08250C04
         *
         * ROM offset:
         * 0x250C04
         */
        offset: 0x250C04,
    
        /**
         * BattleMove structure size.
         *
         * struct BattleMove:
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
         * Remaining 3 bytes padding.
         */
        entrySize: 12,
        
        /**
         * Number of moves.
         */
        count: 355

    }

});