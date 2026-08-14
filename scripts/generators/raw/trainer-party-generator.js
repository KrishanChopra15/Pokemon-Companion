/**
 * Pokémon Companion
 * Trainer Party Generator
 *
 * Generates raw trainer party database.
 *
 * Responsibilities:
 * - Parse trainer parties.
 * - Write trainer-parties.json.
 *
 * Does NOT:
 * - Build generated databases.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const TrainerPartyParser =
    require("../../parsers/game-boy-advance/trainer-party-parser");


class TrainerPartyGenerator {


    /**
     * Generate trainer party raw database.
     *
     * @param {string} game
     */
    generate(game) {


        const parser =
            new TrainerPartyParser();


        const parties =
            parser.parse();



        const output =
            path.join(
                __dirname,
                "../../../database/raw",
                game,
                "trainer-parties.json"
            );



        fs.mkdirSync(
            path.dirname(output),
            {
                recursive: true
            }
        );



        fs.writeFileSync(
            output,
            JSON.stringify(
                parties,
                null,
                2
            )
        );



        console.log(
            `Generated ${Object.keys(parties).length} trainer parties`
        );

    }

}


module.exports = TrainerPartyGenerator;