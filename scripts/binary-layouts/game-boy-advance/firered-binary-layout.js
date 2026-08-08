/**
 * Pokémon Companion
 * FireRed Binary Layout
 *
 * Describes the binary layout of Pokémon FireRed.
 *
 * Verified ROM:
 * Pokémon - FireRed Version (USA, Europe) (Rev 1)
 *
 * SHA-1:
 * dd5945db9b930750cb39d00c84da8571feebf417
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
         */
        offset: 0x254810,

        /**
         * Size of one SpeciesInfo structure.
         */
        entrySize: 28

    }

});