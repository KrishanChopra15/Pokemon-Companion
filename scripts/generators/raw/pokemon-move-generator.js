/**
 * Pokémon Companion
 * Pokémon Move Generator
 *
 * Writes extracted Pokémon moves to the raw database.
 */

"use strict";

const fs = require("fs");
const path = require("path");

class PokemonMoveGenerator {

    generate(moves) {

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
            "pokemon-moves.json"
        );

        fs.writeFileSync(
            outputFile,
            JSON.stringify(moves, null, 4)
        );

        console.log(`Generated ${outputFile}`);

    }

}

module.exports = PokemonMoveGenerator;