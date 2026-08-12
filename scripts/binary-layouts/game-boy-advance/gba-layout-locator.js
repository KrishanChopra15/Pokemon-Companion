/**
 * Pokémon Companion
 * Game Boy Advance Layout Locator
 *
 * Locates important binary tables inside a Game Boy Advance ROM.
 *
 * Responsibilities:
 * - Locate binary tables.
 * - Return table offsets.
 *
 * Does NOT:
 * - Parse Pokémon.
 * - Extract datasets.
 * - Read reference data.
 */

"use strict";

const GbaRomScanner = require("../../readers/game-boy-advance/gba-rom-scanner");
const SpeciesSignatures = require("../../readers/game-boy-advance/signatures/species-signatures");

class GbaLayoutLocator {

    constructor(reader) {

        this.reader = reader;

        this.scanner = new GbaRomScanner(reader);

    }

    locate(signature, tableName) {

        const offset = this.scanner.find(signature);

        if (offset === -1) {

            throw new Error(
                `Unable to locate ${tableName}.`
            );

        }

        return offset;

    }

    findPokemonSpeciesTable() {

        return this.locate(

            SpeciesSignatures.BULBASAUR,

            "Pokémon species table"

        );

    }

}

module.exports = GbaLayoutLocator;