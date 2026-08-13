/**
 * Pokémon Companion
 * Pokémon Egg Move Generator
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PokemonEggMoveExtractor =
require("../../extractors/game-boy-advance/pokemon-egg-move-extractor");


class PokemonEggMoveGenerator {


    generate(game) {


        const extractor =
        new PokemonEggMoveExtractor();


        const data =
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
            "pokemon-egg-moves.json"
        );


        fs.writeFileSync(
            file,
            JSON.stringify(
                data,
                null,
                4
            )
        );


        console.log(
            `Generated ${file}`
        );


        console.log(
            `${data.length} egg move records generated.`
        );


    }


}


module.exports = PokemonEggMoveGenerator;