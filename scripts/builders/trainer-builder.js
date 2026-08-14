/**
 * Pokémon Companion
 * Trainer Builder
 *
 * Builds complete trainer databases.
 *
 * Responsibilities:
 * - Combine trainer definitions.
 * - Attach trainer parties.
 * - Classify trainers.
 * - Create trainer domain objects.
 * - Write full-trainers.json.
 *
 * Does NOT:
 * - Parse source files.
 * - Extract trainer data.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const Trainer =
    require("../domain/trainer");

const TrainerParty =
    require("../domain/trainer-party");

const TrainerPokemon =
    require("../domain/trainer-pokemon");

const TrainerClassifier =
    require("../domain/trainer-classifier");


class TrainerBuilder {


    build(game) {


        const classifier =
            new TrainerClassifier();



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



        const createParty = (partyData) => {


            if (!partyData) {

                return null;

            }



            const pokemon =
                partyData.pokemon.map(
                    mon =>
                        new TrainerPokemon(

                            mon.species,

                            mon.level,

                            mon.iv

                        )
                );



            return new TrainerParty(
                pokemon
            );

        };



        const fullTrainers = {};



        for (const id in trainers) {


            const trainer =
                trainers[id];


            let party = null;



            if (
                trainer.party &&
                parties[trainer.party]
            ) {

                party =
                    createParty(
                        parties[trainer.party]
                    );

            }



            const trainerType =
                classifier.classify({

                    id,

                    ...trainer

                });



            const trainerObject =
                new Trainer(

                    id,

                    trainerType,

                    trainer.trainerClass,

                    trainer.trainerPic,

                    trainer.encounterMusic,

                    trainer.trainerName,

                    trainer.doubleBattle,

                    trainer.aiFlags,

                    party

                );



            fullTrainers[id] =
                trainerObject;

        }



        fs.mkdirSync(
            path.dirname(outputPath),
            {
                recursive:true
            }
        );



        fs.writeFileSync(
            outputPath,
            JSON.stringify(
                fullTrainers,
                null,
                2
            )
        );



        console.log(
            `Generated ${Object.keys(fullTrainers).length} complete trainers`
        );

    }

}


module.exports = TrainerBuilder;