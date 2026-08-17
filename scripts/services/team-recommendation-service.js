/**
 * Pokémon Companion
 * Team Recommendation Service
 *
 * Analyzes user's Pokémon collection
 * and recommends the best team against
 * a trainer or gym opponent.
 *
 * Responsibilities:
 * - Filter available Pokémon.
 * - Compare Pokémon matchups.
 * - Analyze type advantages.
 * - Compare levels.
 * - Rank team candidates.
 * - Provide recommendation summaries.
 *
 * Does NOT:
 * - Execute battles.
 * - Calculate exact damage.
 * - Manage Pokémon storage.
 * - Manage trainers.
 * - Load ROM data.
 */

"use strict";





class TeamRecommendationService {



    constructor(
        availabilityService = null
    )
    {


        this.availability =
            availabilityService;





        this.typeAdvantages =
        {

            NORMAL:
            {

                strong: [],

                weak: []

            },



            FIRE:
            {

                strong:
                [
                    "GRASS",
                    "ICE",
                    "BUG",
                    "STEEL"
                ],

                weak:
                [
                    "WATER",
                    "GROUND",
                    "ROCK"
                ]

            },



            WATER:
            {

                strong:
                [
                    "FIRE",
                    "GROUND",
                    "ROCK"
                ],

                weak:
                [
                    "ELECTRIC",
                    "GRASS"
                ]

            },



            GRASS:
            {

                strong:
                [
                    "WATER",
                    "GROUND",
                    "ROCK"
                ],

                weak:
                [
                    "FIRE",
                    "ICE",
                    "POISON",
                    "FLYING",
                    "BUG"
                ]

            },



            ELECTRIC:
            {

                strong:
                [
                    "WATER",
                    "FLYING"
                ],

                weak:
                [
                    "GROUND"
                ]

            },



            PSYCHIC:
            {

                strong:
                [
                    "FIGHTING",
                    "POISON"
                ],

                weak:
                [
                    "BUG",
                    "GHOST",
                    "DARK"
                ]

            }


        };


    }









    //--------------------------------
    // Filter available Pokemon
    //--------------------------------


    filterAvailable(
        pokemon,
        context = {}
    )
    {


        if(
            !this.availability
        )
        {

            return pokemon;

        }








        return pokemon.filter(

            member => {


                const result =
                    this.availability.isAvailable(

                        member.species,

                        context

                    );



                return result.available;


            }

        );


    }









    //--------------------------------
    // Calculate matchup score
    //--------------------------------


    calculateScore(
        pokemon,
        opponent
    )
    {


        let score =
            0;








        const pokemonType =
            pokemon.type ||

            pokemon.type1 ||

            null;








        const opponentType =
            opponent.type ||

            opponent.type1 ||

            null;








        if(
            pokemon.level
            &&
            opponent.level
        )
        {

            score +=

                pokemon.level -

                opponent.level;

        }








        if(
            pokemonType
            &&
            opponentType
        )
        {

            const advantage =
                this.checkTypeAdvantage(

                    pokemonType,

                    opponentType

                );



            if(
                advantage === "SUPER"
            )
            {

                score += 50;

            }



            if(
                advantage === "WEAK"
            )
            {

                score -= 50;

            }


        }








        return score;


    }









    //--------------------------------
    // Type advantage check
    //--------------------------------


    checkTypeAdvantage(
        attackerType,
        defenderType
    )
    {


        const attacker =
            attackerType.toUpperCase();



        const defender =
            defenderType.toUpperCase();








        const data =
            this.typeAdvantages[attacker];








        if(
            !data
        )
        {

            return "NORMAL";

        }








        if(
            data.strong.includes(
                defender
            )
        )
        {

            return "SUPER";

        }








        if(
            data.weak.includes(
                defender
            )
        )
        {

            return "WEAK";

        }








        return "NORMAL";


    }









    //--------------------------------
    // Recommend team
    //--------------------------------


    recommendTeam(
        availablePokemon,
        opponents,
        size = 6,
        context = {}
    )
    {


        if(
            !availablePokemon
            ||
            !opponents
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon data"

            };

        }








        const possiblePokemon =
            this.filterAvailable(

                availablePokemon,

                context

            );








        const ranked =
            possiblePokemon.map(

                pokemon =>

                {


                    let score =
                        0;








                    opponents.forEach(

                        opponent =>

                        {

                            score +=

                                this.calculateScore(

                                    pokemon,

                                    opponent

                                );

                        }

                    );








                    return {


                        pokemon,


                        score


                    };


                }

            );








        ranked.sort(

            (a,b)=>

                b.score -

                a.score

        );








        const team =
            ranked

            .slice(

                0,

                size

            )

            .map(

                item =>

                    item.pokemon

            );








        return {


            success:true,


            team,


            ranking:

                ranked


        };


    }









    //--------------------------------
    // Summary
    //--------------------------------


    createSummary(
        result
    )
    {


        return {


            recommended:

                result.team.map(

                    pokemon =>

                        pokemon.species

                ),


            count:

                result.team.length


        };


    }



}





module.exports =
    TeamRecommendationService;