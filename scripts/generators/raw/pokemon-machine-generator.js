/**
 * Pokémon Companion
 * Pokémon Machine Generator
 *
 * Generates the raw Pokémon TM/HM compatibility database.
 *
 * Responsibilities:
 * - Extract TM/HM compatibility.
 * - Write pokemon-machines.json.
 *
 * Does NOT:
 * - Resolve machine names.
 * - Resolve move references.
 * - Build generated databases.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PokemonMachineExtractor =
require("../../extractors/game-boy-advance/pokemon-machine-extractor");


class PokemonMachineGenerator {


    /**
     * Generate raw machine database.
     *
     * @param {string} game
     */
    generate(game) {


        const extractor =
        new PokemonMachineExtractor();


        const machines =
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
            "pokemon-machines.json"
        );



        fs.writeFileSync(
            file,
            JSON.stringify(
                machines,
                null,
                4
            )
        );


        console.log();

        console.log(
            `Generated ${file}`
        );


        console.log(
            `${machines.length} machine records generated.`
        );

        console.log();


    }

}


module.exports = PokemonMachineGenerator;