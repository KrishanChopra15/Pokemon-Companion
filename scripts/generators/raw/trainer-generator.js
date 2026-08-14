/**
 * Pokémon Companion
 * Trainer Generator
 *
 * Generates raw trainer database.
 *
 * Responsibilities:
 * - Parse trainer definitions.
 * - Write trainers.json.
 *
 * Does NOT:
 * - Build generated databases.
 * - Resolve references.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const TrainerParser =
    require("../../parsers/game-boy-advance/trainer-parser");


class TrainerGenerator {


    /**
     * Generate trainer raw database.
     *
     * @param {string} game
     */
    generate(game) {


        const parser =
            new TrainerParser();


        const trainers =
            parser.parse();



        const output =
            path.join(
                __dirname,
                "../../../database/raw",
                game,
                "trainers.json"
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
                trainers,
                null,
                2
            )
        );



        console.log(
            `Generated ${Object.keys(trainers).length} trainers`
        );

    }

}


module.exports = TrainerGenerator;