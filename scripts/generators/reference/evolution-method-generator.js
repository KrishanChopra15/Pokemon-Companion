/**
 * Pokémon Companion
 * Evolution Method Generator
 *
 * Generates the Pokémon Evolution Method reference database.
 */

"use strict";

const ReferenceGenerator = require("./reference-generator");
const DefineParser = require("../../parsers/reference/define-parser");

class EvolutionMethodGenerator extends ReferenceGenerator {

    /**
     * Generate the evolution method database.
     */
    generate() {

        const source = this.readSourceFile(
            "pokefirered",
            "include",
            "constants",
            "pokemon.h"
        );

        const parser = new DefineParser();

        const methods = parser.parse(
            source,
            "EVO_"
        );

        const evolutionMethods = methods.filter(method =>
            !method.constant.startsWith("EVO_MODE_")
        );

        this.writeDatabase(
            "evolution-methods",
            evolutionMethods
        );

    }

}

module.exports = EvolutionMethodGenerator;