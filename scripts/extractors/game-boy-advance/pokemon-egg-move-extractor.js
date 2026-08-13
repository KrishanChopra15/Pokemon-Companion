/**
 * Pokémon Companion
 * Pokémon Egg Move Extractor
 *
 * Extracts egg moves from pokefirered.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const EggMoveParser =
require("../../parsers/game-boy-advance/egg-move-parser");


class PokemonEggMoveExtractor {


    extractAll() {


        const file =
        path.join(

            process.cwd(),

            "..",

            "References",

            "pokefirered",

            "src",

            "data",

            "pokemon",

            "egg_moves.h"

        );


        const source =
        fs.readFileSync(
            file,
            "utf8"
        );


        return this.parse(source);

    }



    parse(source) {


        const results = [];

        const parser =
        new EggMoveParser();


        const regex =
        /egg_moves\(([A-Z0-9_]+),([\s\S]*?)\),/g;


        let match;


        while ((match = regex.exec(source)) !== null) {


            results.push({

                species:
                "SPECIES_" + match[1],


                moves:
                parser.parse(match[2])

            });


        }


        return results;

    }


}


module.exports = PokemonEggMoveExtractor;