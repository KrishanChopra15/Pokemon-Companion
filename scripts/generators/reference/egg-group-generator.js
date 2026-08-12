/**
 * Pokémon Companion
 * Egg Group Generator
 *
 * Generates the Pokémon Egg Group reference database.
 *
 * Responsibilities:
 * - Read constants/pokemon.h
 * - Extract Egg Groups
 * - Write egg-groups.json
 */

"use strict";

const ReferenceGenerator = require("./reference-generator");

const DefineParser = require("../../parsers/reference/define-parser");

class EggGroupGenerator extends ReferenceGenerator {

    /**
     * Generate the Egg Group database.
     */
    generate() {

        const source = this.readSourceFile(
            "pokefirered",
            "include",
            "constants",
            "pokemon.h"
        );

        const parser = new DefineParser();

        const eggGroups = parser.parse(
            source,
            "EGG_GROUP_"
        );

        this.writeDatabase(
            "egg-groups",
            eggGroups
        );

    }

}

module.exports = EggGroupGenerator;