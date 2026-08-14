/**
 * Pokémon Companion
 * Trainer Recommendation Service
 *
 * Recommends Pokémon against trainers.
 *
 * Responsibilities:
 * - Analyze trainer weaknesses.
 * - Suggest counters.
 *
 * Does NOT:
 * - Load databases directly.
 * - Parse source files.
 */

"use strict";


class TrainerRecommendationService {


    constructor(
        pokemonDatabase
    ) {

        this.pokemonDatabase =
            pokemonDatabase;

    }



    recommend(analysis) {


        const weaknesses =
            this.getWeaknesses(
                analysis.types
            );


        const recommendations =
            this.findPokemon(
                weaknesses
            );


        return {

            trainer:
                analysis.name,


            weaknesses,


            recommendations

        };

    }



    getWeaknesses(types) {


        const weaknesses =
            new Set();



        types.forEach(
            type => {


                if (type === "Rock") {

                    weaknesses.add("Water");

                    weaknesses.add("Grass");

                    weaknesses.add("Fighting");

                    weaknesses.add("Ground");

                    weaknesses.add("Steel");

                }



                if (type === "Ground") {

                    weaknesses.add("Water");

                    weaknesses.add("Grass");

                    weaknesses.add("Ice");

                }


            }
        );


        return [
            ...weaknesses
        ];

    }



    findPokemon(types) {


        return this.pokemonDatabase
            .getAllPokemon()
            .filter(
                pokemon => {


                    return (

                        (pokemon.type1 &&
                        types.includes(
                            pokemon.type1.name
                        ))

                        ||

                        (pokemon.type2 &&
                        types.includes(
                            pokemon.type2.name
                        ))

                    );

                }
            )
            .slice(0,10)
            .map(
                pokemon =>
                    pokemon.name
            );

    }


}


module.exports = TrainerRecommendationService;