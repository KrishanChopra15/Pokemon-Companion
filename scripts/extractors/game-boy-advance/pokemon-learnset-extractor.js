/**
 * Pokémon Companion
 * Game Boy Advance Pokémon Learnset Extractor
 *
 * Extracts Pokémon level-up learnsets
 * from pokefirered source data.
 *
 * Source:
 * level_up_learnsets.h
 *
 * Responsibilities:
 * - Read level-up learnset source.
 * - Extract Pokémon learnsets.
 * - Produce Pokémon Learnset objects.
 *
 * Does NOT:
 * - Build databases.
 * - Resolve move references.
 * - Read ROM data.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PokemonLearnset =
require("../../domain/pokemon-learnset");

const LearnsetParser =
require("../../parsers/game-boy-advance/learnset-parser");


class PokemonLearnsetExtractor {


    /**
     * Extract all Pokémon learnsets.
     *
     * @returns {PokemonLearnset[]}
     */
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

            "level_up_learnsets.h"

        );


        const source =
        fs.readFileSync(
            file,
            "utf8"
        );


        return this.parse(source);


    }



    /**
     * Parse the complete learnset file.
     *
     * @param {string} source
     * @returns {PokemonLearnset[]}
     */
    parse(source) {


        const learnsets = [];

        const parser =
        new LearnsetParser();



        const regex =
        /static const u16 s([A-Za-z0-9]+)LevelUpLearnset\[\]\s*=\s*\{([\s\S]*?)LEVEL_UP_END\s*\};/g;



        let match;



        while ((match = regex.exec(source)) !== null) {


            const species =
            "SPECIES_" + match[1].toUpperCase();


            const block =
            match[2];


            const moves = [];



            const entries =
            block.match(
                /LEVEL_UP_MOVE\([^)]+\)/g
            );



            if (entries) {


                for (const entry of entries) {


                    const move =
                    parser.parse(entry);



                    if (move) {

                        moves.push(move);

                    }


                }


            }



            learnsets.push(

                new PokemonLearnset({

                    species,

                    moves

                })

            );


        }


        return learnsets;


    }


}


module.exports = PokemonLearnsetExtractor;