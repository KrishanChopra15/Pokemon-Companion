/**
 * Pokémon Companion
 * Pokémon Species Generator
 *
 * Writes extracted Pokémon species to the raw database.
 */

"use strict";

const fs = require("fs");
const path = require("path");

class PokemonSpeciesGenerator {

    generate(species) {

        const outputDirectory = path.join(
            process.cwd(),
            "database",
            "raw",
            "firered"
        );

        fs.mkdirSync(outputDirectory, {
            recursive: true
        });

        const outputFile = path.join(
            outputDirectory,
            "pokemon-species.json"
        );

        fs.writeFileSync(
            outputFile,
            JSON.stringify(species, null, 4)
        );

        console.log(`Generated ${outputFile}`);

    }

}

module.exports = PokemonSpeciesGenerator;