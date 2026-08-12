/**
 * Pokémon Companion
 * Species Name Generator
 *
 * Generates the reference database of Pokémon species names
 * from the pokefirered decompilation.
 *
 * Responsibilities:
 * - Read species_names.h
 * - Parse Pokémon species names
 * - Write species-names.json
 *
 * Does NOT:
 * - Read ROMs
 * - Parse binary data
 * - Understand Pokémon species structures
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ReferenceFileReader = require("../../readers/reference/reference-file-reader");
const SpeciesNameParser = require("../../parsers/reference/species-name-parser");

class SpeciesNameGenerator {

    /**
     * Generate the species name database.
     */
    generate() {

        const reader = new ReferenceFileReader(
            path.join(
                process.cwd(),
                "..",
                "References"
            )
        );

        const parser = new SpeciesNameParser();

        const source = reader.read(
            "pokefirered/src/data/text/species_names.h"
        );

        const speciesNames = parser.parse(source);

        const outputDirectory = path.join(
            process.cwd(),
            "database",
            "reference"
        );

        const outputFile = path.join(
            outputDirectory,
            "species-names.json"
        );

        fs.mkdirSync(
            outputDirectory,
            {
                recursive: true
            }
        );

        fs.writeFileSync(
            outputFile,
            JSON.stringify(
                speciesNames,
                null,
                4
            )
        );

        console.log(
            `Generated ${outputFile}`
        );

        console.log(
            `${speciesNames.length} species names extracted.`
        );

    }

}

module.exports = SpeciesNameGenerator;