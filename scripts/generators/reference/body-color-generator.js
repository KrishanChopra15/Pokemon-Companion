/**
 * Pokémon Companion
 * Body Color Generator
 *
 * Generates the Pokémon Body Color reference database.
 *
 * Responsibilities:
 * - Read constants/pokemon.h
 * - Extract body colors.
 * - Write body-colors.json.
 */

"use strict";

const ReferenceGenerator = require("./reference-generator");
const DefineParser = require("../../parsers/reference/define-parser");

class BodyColorGenerator extends ReferenceGenerator {

    /**
     * Generate the body color database.
     */
    generate() {

        const source = this.readSourceFile(
            "pokefirered",
            "include",
            "constants",
            "pokemon.h"
        );

        const parser = new DefineParser();

        const bodyColors = parser.parse(
            source,
            "BODY_COLOR_"
        );

        this.writeDatabase(
            "body-colors",
            bodyColors
        );

    }

}

module.exports = BodyColorGenerator;