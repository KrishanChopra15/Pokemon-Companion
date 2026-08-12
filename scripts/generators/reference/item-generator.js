/**
 * Pokémon Companion
 * Item Generator
 *
 * Generates the Pokémon Item reference database.
 *
 * Responsibilities:
 * - Read constants/items.h
 * - Extract item constants
 * - Write items.json
 */

"use strict";

const ReferenceGenerator = require("./reference-generator");
const DefineParser = require("../../parsers/reference/define-parser");

class ItemGenerator extends ReferenceGenerator {

    /**
     * Generate the item database.
     */
    generate() {

        const source = this.readSourceFile(
            "pokefirered",
            "include",
            "constants",
            "items.h"
        );

        const parser = new DefineParser();

        const items = parser.parse(
            source,
            "ITEM_"
        );

        this.writeDatabase(
            "items",
            items
        );

    }

}

module.exports = ItemGenerator;