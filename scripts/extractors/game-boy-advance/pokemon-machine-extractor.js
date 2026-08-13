/**
 * Pokémon Companion
 * Game Boy Advance Pokémon Machine Extractor
 *
 * Extracts TM/HM compatibility data.
 *
 * Source:
 * tmhm_learnsets.h
 */

"use strict";

const fs = require("fs");
const path = require("path");

const MachineLearnsetParser =
require("../../parsers/game-boy-advance/machine-learnset-parser");


class PokemonMachineExtractor {


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

            "tmhm_learnsets.h"

        );


        const source =
        fs.readFileSync(
            file,
            "utf8"
        );


        return this.parse(source);


    }



    parse(source) {


        const machines = [];

        const parser =
        new MachineLearnsetParser();


        const regex =
        /\[SPECIES_([A-Z0-9_]+)\]\s*=\s*TMHM_LEARNSET\(([\s\S]*?)\),/g;


        let match;


        while ((match = regex.exec(source)) !== null) {


            const species =
            "SPECIES_" + match[1];


            const block =
            match[2];


            machines.push(

                parser.parse(
                    species,
                    block
                )

            );


        }


        return machines;


    }


}


module.exports = PokemonMachineExtractor;