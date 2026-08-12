/**
 * Pokémon Companion
 * Pokémon Learnset Generator
 *
 * Generates the raw Pokémon learnset database.
 *
 * Responsibilities:
 * - Extract level-up learnsets.
 * - Write pokemon-learnsets.json.
 *
 * Does NOT:
 * - Build generated databases.
 * - Resolve references.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PokemonLearnsetExtractor =
require("../../extractors/game-boy-advance/pokemon-learnset-extractor");


class PokemonLearnsetGenerator {


    /**
     * Generate raw learnset database.
     *
     * @param {string} game
     */
    generate(game) {


        const extractor =
        new PokemonLearnsetExtractor();


        const learnsets =
        extractor.extractAll();



        const directory =
        path.join(
            process.cwd(),
            "database",
            "raw",
            game
        );



        fs.mkdirSync(
            directory,
            {
                recursive:true
            }
        );



        const file =
        path.join(
            directory,
            "pokemon-learnsets.json"
        );



        fs.writeFileSync(
            file,
            JSON.stringify(
                learnsets,
                null,
                4
            )
        );



        console.log();

        console.log(
            `Generated ${file}`
        );


        console.log(
            `${learnsets.length} learnset records generated.`
        );


        console.log();


    }


}


module.exports = PokemonLearnsetGenerator;