/**
 * Pokémon Companion
 * Trainer Party Parser
 *
 * Parses trainer parties from pokefirered source.
 *
 * Responsibilities:
 * - Read trainer_parties.h
 * - Extract trainer Pokémon parties.
 * - Return party data.
 *
 * Does NOT:
 * - Write databases.
 * - Build generated databases.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class TrainerPartyParser {


    constructor() {

        this.source = path.join(
            __dirname,
            "../../../../References/pokefirered/src/data/trainer_parties.h"
        );

    }



    parse() {


        const text =
            fs.readFileSync(
                this.source,
                "utf8"
            );


        const startMarker =
            "// Start of actual trainer data";


        const startIndex =
            text.indexOf(startMarker);


        if (startIndex === -1) {

            throw new Error(
                "Could not find trainer data"
            );

        }


        const trainerData =
            text.slice(startIndex);



        const parties = {};


        const partyRegex =
        /static const struct ([A-Za-z0-9_]+) (sParty_[A-Za-z0-9]+)\[\] = \{([\s\S]*?)\};/g;


        let match;


        while ((match = partyRegex.exec(trainerData)) !== null) {


            const structType = match[1];
            const partyName = match[2];
            const body = match[3];


            const pokemon = [];


            const pokemonRegex =
            /(?:\.iv = (\d+),\s*)?\.lvl = (\d+),\s*\.species = SPECIES_([A-Z0-9_]+)/g;


            let mon;


            while ((mon = pokemonRegex.exec(body)) !== null) {


                pokemon.push({

                    species: mon[3],

                    level:
                        Number(mon[2]),

                    iv:
                        mon[1]
                            ? Number(mon[1])
                            : 0

                });

            }


            parties[partyName] = {

                structType,

                pokemon

            };

        }


        return parties;

    }

}


module.exports = TrainerPartyParser;