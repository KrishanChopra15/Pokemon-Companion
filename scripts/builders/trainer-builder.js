/**
 * Pokémon Companion
 * Trainer Builder
 *
 * Builds complete trainer databases.
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

const ReferenceRegistry =
    require("./reference-registry");



class TrainerBuilder {



    build(game) {



        const classifier =
            new TrainerClassifier();



        const references =
            new ReferenceRegistry();




        const rawPath =
            path.join(
                __dirname,
                "../../database/raw",
                game
            );



        const outputPath =
            path.join(
                __dirname,
                "../../database/generated",
                game,
                "full-trainers.json"
            );





        const trainers =
            JSON.parse(

                fs.readFileSync(

                    path.join(
                        rawPath,
                        "trainers.json"
                    ),

                    "utf8"

                )

            );





        const parties =
            JSON.parse(

                fs.readFileSync(

                    path.join(
                        rawPath,
                        "trainer-parties.json"
                    ),

                    "utf8"

                )

            );






        function resolveSpecies(species) {


            const result =
                references.speciesNames
                    .getByConstant(
                        species
                    );


            if(!result) {

                return {

                    id:null,

                    name:species

                };

            }


            return {

                id:
                    result.id,

                name:
                    result.name

            };


        }







        function resolveMove(move) {


            const result =
                references.moveNames
                    .getByConstant(
                        move
                    );


            if(!result) {

                return {

                    id:null,

                    name:move

                };

            }


            return {

                id:
                    result.id,

                name:
                    result.name

            };


        }








        const createParty = (partyData) => {


            if(!partyData) {

                return null;

            }



            const pokemon =

                partyData.pokemon.map(mon => {



                    const species =
                        resolveSpecies(
                            mon.species
                        );



                    const moves =

                        (mon.moves || [])
                            .map(
                                resolveMove
                            );




                    return new TrainerPokemon({

                        species:
                            species.name,


                        speciesId:
                            species.id,


                        level:
                            mon.level,


                        iv:
                            mon.iv || 0,


                        heldItem:
                            mon.heldItem || null,


                        moves

                    });


                });





            return new TrainerParty(
                pokemon
            );


        };







        const fullTrainers = {};






        for(const id in trainers) {



            const trainer =
                trainers[id];



            let party = null;



            if(
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






            fullTrainers[id] =

                new Trainer({

                    id,


                    trainerType,


                    trainerClass:
                        trainer.trainerClass,


                    trainerPic:
                        trainer.trainerPic,


                    encounterMusic:
                        trainer.encounterMusic,


                    trainerName:
                        trainer.trainerName,


                    doubleBattle:
                        trainer.doubleBattle,


                    aiFlags:
                        trainer.aiFlags,


                    party

                });


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

            ),

            "utf8"

        );






        console.log(
            `Generated ${Object.keys(fullTrainers).length} complete trainers`
        );


    }


}



module.exports =
    TrainerBuilder;