/**
 * Pokémon Companion
 * Pokémon Evolution Generator
 *
 * Generates the raw Pokémon evolution database.
 *
 * Responsibilities:
 * - Extract evolution data.
 * - Write pokemon-evolutions.json.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PokemonEvolutionExtractor = require("../../extractors/game-boy-advance/pokemon-evolution-extractor");

class PokemonEvolutionGenerator {

    /**
     * Generate the raw evolution database.
     *
     * @param {string} game
     */
    generate(game) {

        const extractor = new PokemonEvolutionExtractor();

        const evolutions = extractor.extractAll();

        const directory = path.join(
            process.cwd(),
            "database",
            "raw",
            game
        );

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );

        const file = path.join(
            directory,
            "pokemon-evolutions.json"
        );

        fs.writeFileSync(
            file,
            JSON.stringify(
                evolutions,
                null,
                4
            )
        );

        console.log();

        console.log(
            `Generated ${file}`
        );

        console.log(
            `${evolutions.length} evolution records generated.`
        );

        console.log();

    }

}

module.exports = PokemonEvolutionGenerator;