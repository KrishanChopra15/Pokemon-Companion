/**
 * Pokémon Companion
 * Trainer Recommendation Service
 *
 * Recommends Pokémon against trainers.
 *
 * Responsibilities:
 * - Analyze trainer weaknesses.
 * - Suggest counters.
 * - Rank available Pokémon.
 *
 * Does NOT:
 * - Load databases directly.
 * - Parse source files.
 * - Execute battles.
 */

"use strict";





class TrainerRecommendationService {



    constructor(
        pokemonDatabase
    )
    {


        this.pokemonDatabase =
            pokemonDatabase;


    }









    //--------------------------------
    // Recommend against trainer
    //--------------------------------


    recommend(
        analysis,
        playerPokemon = []
    )
    {


        if(
            !analysis
        )
        {

            return null;

        }








        const weaknesses =
            this.getWeaknesses(

                analysis.types

            );








        const recommendations =
            playerPokemon.length

            ?

            this.rankPlayerPokemon(

                playerPokemon,

                weaknesses

            )

            :

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









    //--------------------------------
    // Type weaknesses
    //--------------------------------


    getWeaknesses(
        types
    )
    {


        const weaknesses =
            new Set();





        types.forEach(

            type => {


                switch(
                    type
                )
                {


                    case "Rock":

                        weaknesses.add(
                            "Water"
                        );

                        weaknesses.add(
                            "Grass"
                        );

                        weaknesses.add(
                            "Fighting"
                        );

                        weaknesses.add(
                            "Ground"
                        );

                        weaknesses.add(
                            "Steel"
                        );

                        break;




                    case "Ground":

                        weaknesses.add(
                            "Water"
                        );

                        weaknesses.add(
                            "Grass"
                        );

                        weaknesses.add(
                            "Ice"
                        );

                        break;




                    case "Water":

                        weaknesses.add(
                            "Electric"
                        );

                        weaknesses.add(
                            "Grass"
                        );

                        break;



                    case "Fire":

                        weaknesses.add(
                            "Water"
                        );

                        weaknesses.add(
                            "Ground"
                        );

                        weaknesses.add(
                            "Rock"
                        );

                        break;



                }


            }

        );





        return [

            ...weaknesses

        ];


    }









    //--------------------------------
    // Find database counters
    //--------------------------------


    findPokemon(
        types
    )
    {


        return this.pokemonDatabase

            .getAllPokemon()

            .filter(

                pokemon =>


                    (

                        pokemon.type1 &&

                        types.includes(

                            pokemon.type1.name

                        )

                    )

                    ||

                    (

                        pokemon.type2 &&

                        types.includes(

                            pokemon.type2.name

                        )

                    )


            )

            .slice(

                0,

                10

            )

            .map(

                pokemon =>

                    pokemon.name

            );


    }









    //--------------------------------
    // Rank player's Pokemon
    //--------------------------------


    rankPlayerPokemon(
        team,
        weaknesses
    )
    {


        return team

            .map(

                pokemon => {


                    const data =
                        this.pokemonDatabase.getPokemon(

                            pokemon.species

                        );



                    if(
                        !data
                    )
                    {

                        return null;

                    }



                    let score =
                        0;




                    if(

                        data.type1 &&

                        weaknesses.includes(

                            data.type1.name

                        )

                    )
                    {

                        score += 50;

                    }



                    if(

                        data.type2 &&

                        weaknesses.includes(

                            data.type2.name

                        )

                    )
                    {

                        score += 50;

                    }



                    score +=

                        pokemon.level || 0;



                    return {


                        pokemon:

                            pokemon.species,


                        level:

                            pokemon.level,


                        score


                    };


                }

            )

            .filter(

                Boolean

            )

            .sort(

                (a,b)=>

                    b.score - a.score

            );


    }



}





module.exports =
    TrainerRecommendationService;