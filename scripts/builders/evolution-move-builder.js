/**
 * Pokémon Companion
 * Evolution Move Builder
 *
 * Finds moves that are available in previous
 * evolution stages but unavailable after evolving.
 */

"use strict";


class EvolutionMoveBuilder {


    build(species, allSpecies) {


        const previousStages =
        this.findPreviousStages(
            species,
            allSpecies
        );


        if (previousStages.length === 0) {

            return [];

        }


        const currentMoves =
        new Set(
            species.learnset.map(
                m => m.move.constant
            )
        );


        const result = [];


        for (const previous of previousStages) {


            for (const move of previous.learnset) {


                const constant =
                move.move.constant;


                if (!currentMoves.has(constant)) {


                    result.push({
                    
                        species: {
                            id: previous.id,
                            name: previous.name
                        },
                    
                        level: move.level,
                    
                        move: move.move
                    
                    });


                }


            }


        }


        return result;


    }



    findPreviousStages(species, allSpecies) {


        const previous = [];


        let current =
        species;


        while (true) {


            const parent =
            allSpecies.find(
                p =>
                p.evolutions.some(
                    e =>
                    e.targetSpecies.name === current.name
                )
            );


            if (!parent) {

                break;

            }


            previous.push(parent);


            current = parent;


        }


        return previous;


    }


}


module.exports = EvolutionMoveBuilder;