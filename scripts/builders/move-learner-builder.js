/**
 * Pokémon Companion
 * Move Learner Builder
 *
 * Adds complete move information
 * and evolution inherited moves.
 */

"use strict";

const Builder =
require("./builder");


class MoveLearnerBuilder extends Builder {


    build(game) {


        const learners =
        this.loadGeneratedDatabase(
            game,
            "move-learners"
        );


        const moves =
        this.loadGeneratedDatabase(
            game,
            "pokemon-moves"
        );


        const species =
        this.loadGeneratedDatabase(
            game,
            "pokemon-species"
        );



        const moveMap =
        new Map();


        for (const move of moves) {

            moveMap.set(
                move.constant,
                move
            );

        }



        const generated =
        learners.map(entry => {


            const move =
            moveMap.get(
                entry.move.constant
            );


            return {

                move,

                learners:
                entry.learners.map(
                    learner => ({

                        ...learner,

                        source:"direct"

                    })
                )

            };


        });



        //----------------------------------------
        // Add evolution inherited learners
        //----------------------------------------


        const moveLookup =
        new Map();


        for (const entry of generated) {

            moveLookup.set(
                entry.move.constant,
                entry
            );

        }



        for (const pokemon of species) {


            if (!pokemon.evolutionLostMoves)
                continue;



            for (const lostMove of pokemon.evolutionLostMoves) {


                const moveEntry =
                moveLookup.get(
                    lostMove.move.constant
                );


                if (!moveEntry)
                    continue;



                const exists =
                moveEntry.learners.some(
                    learner =>
                    learner.pokemon.id === pokemon.id
                );


                if (exists)
                    continue;



                moveEntry.learners.push({

                    pokemon:{
                        id:pokemon.id,
                        name:pokemon.name
                    },

                    method:"EVOLUTION_INHERITED",

                    source:"evolution",

                    inheritedFrom:
                    lostMove.species

                });



            }


        }




        this.saveGeneratedDatabase(
            game,
            "move-learners",
            generated
        );




        //----------------------------------------
        // Reverse lookup
        //----------------------------------------


        const pokemonMoves = {};



        for (const entry of generated) {


            for (const learner of entry.learners) {


                const id =
                learner.pokemon.id;



                if (!pokemonMoves[id])
                {
                    pokemonMoves[id] = [];
                }



                pokemonMoves[id].push({

                    move:
                    entry.move,


                    method:
                    learner.method,


                    level:
                    learner.level || null,


                    source:
                    learner.source,

                    
                    inheritedFrom:
                    learner.inheritedFrom || null

                });


            }


        }



        this.saveGeneratedDatabase(
            game,
            "pokemon-move-learners",
            pokemonMoves
        );



        console.log(
            "Generated move learner database."
        );


    }


}


module.exports = MoveLearnerBuilder;