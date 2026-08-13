/**
 * Pokémon Companion
 * Move Learner Generator
 *
 * Generates reverse move lookup database.
 *
 * Converts:
 *
 * Pokémon -> Moves
 *
 * into:
 *
 * Move -> Pokémon
 *
 * Responsibilities:
 * - Read generated Pokémon species database.
 * - Collect all move learning methods.
 * - Group Pokémon by move.
 * - Write move-learners.json.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class MoveLearnerGenerator {


    generate(game) {


        //----------------------------------------
        // Load generated species database
        //----------------------------------------

        const file =
        path.join(
            process.cwd(),
            "database",
            "generated",
            game,
            "pokemon-species.json"
        );


        const species =
        JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );


        const moveMap =
        new Map();



        //----------------------------------------
        // Process Pokémon
        //----------------------------------------

        for (const pokemon of species) {


            const pokemonInfo = {

                id:
                    pokemon.id,

                name:
                    pokemon.name

            };



            //--------------------------------
            // Level up moves
            //--------------------------------

            for (const entry of pokemon.learnset || []) {


                this.addLearner(

                    moveMap,

                    entry.move,

                    {

                        pokemon:
                            pokemonInfo,

                        method:
                            "LEVEL",

                        level:
                            entry.level

                    }

                );


            }



            //--------------------------------
            // Egg moves
            //--------------------------------

            for (const move of pokemon.eggMoves || []) {


                this.addLearner(

                    moveMap,

                    move,

                    {

                        pokemon:
                            pokemonInfo,

                        method:
                            "EGG"

                    }

                );


            }



            //--------------------------------
            // TM/HM moves
            //--------------------------------

            for (const machine of pokemon.machines || []) {


                this.addLearner(

                    moveMap,

                    machine.move,

                    {

                        pokemon:
                            pokemonInfo,

                        method:
                            "TMHM",

                        machine:
                            machine.name

                    }

                );


            }


        }



        //----------------------------------------
        // Save
        //----------------------------------------

        const output =
        Array.from(
            moveMap.values()
        );


        const directory =
        path.join(
            process.cwd(),
            "database",
            "generated",
            game
        );


        fs.mkdirSync(
            directory,
            {
                recursive:true
            }
        );


        const outputFile =
        path.join(
            directory,
            "move-learners.json"
        );


        fs.writeFileSync(

            outputFile,

            JSON.stringify(
                output,
                null,
                4
            )

        );


        console.log();

        console.log(
            `Generated ${outputFile}`
        );

        console.log(
            `Moves: ${output.length}`
        );

        console.log();

    }



    addLearner(
        map,
        move,
        learner
    ) {

        if (!move) {

            return;

        }


        //----------------------------------------
        // Create move entry if missing
        //----------------------------------------

        if (!map.has(move.constant)) {

            map.set(
                move.constant,
                {
                    move,
                    learners:[]
                }
            );

        }


        const list =
        map
        .get(move.constant)
        .learners;



        //----------------------------------------
        // Prevent duplicates
        //----------------------------------------

        const exists =
        list.some(existing =>

            existing.pokemon.id === learner.pokemon.id
            &&
            existing.method === learner.method
            &&
            existing.level === learner.level
            &&
            existing.machine === learner.machine

        );



        if (!exists) {

            list.push(
                learner
            );

        }

    }


}


module.exports = MoveLearnerGenerator;