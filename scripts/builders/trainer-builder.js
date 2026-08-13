/**
 * Pokémon Companion
 * Trainer Builder
 *
 * Builds complete trainer databases.
 *
 * Responsibilities:
 * - Combine trainer definitions.
 * - Attach trainer parties.
 * - Write full-trainers.json.
 *
 * Does NOT:
 * - Parse source files.
 * - Extract trainer data.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class TrainerBuilder {

    build(game) {

        const rawPath = path.join(
            __dirname,
            "../../database/raw",
            game
        );


        const outputPath = path.join(
            __dirname,
            "../../database/generated",
            game,
            "full-trainers.json"
        );


        const trainers = JSON.parse(
            fs.readFileSync(
                path.join(rawPath, "trainers.json"),
                "utf8"
            )
        );


        const parties = JSON.parse(
            fs.readFileSync(
                path.join(rawPath, "trainer-parties.json"),
                "utf8"
            )
        );


        const fullTrainers = {};


        for (const id in trainers) {

            const trainer = trainers[id];

            let party = null;


            if (trainer.party && parties[trainer.party]) {
                party = parties[trainer.party].pokemon;
            }


            fullTrainers[id] = {

                trainerClass: trainer.trainerClass,

                trainerPic: trainer.trainerPic,

                encounterMusic: trainer.encounterMusic,

                trainerName: trainer.trainerName,

                doubleBattle: trainer.doubleBattle,

                aiFlags: trainer.aiFlags,

                party

            };

        }


        fs.mkdirSync(
            path.dirname(outputPath),
            {
                recursive: true
            }
        );


        fs.writeFileSync(
            outputPath,
            JSON.stringify(fullTrainers, null, 2)
        );


        console.log(
            `Generated ${Object.keys(fullTrainers).length} complete trainers`
        );

    }

}


module.exports = TrainerBuilder;