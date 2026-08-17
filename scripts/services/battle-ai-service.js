/**
 * Pokémon Companion
 * Battle AI Service
 *
 * Handles battle prediction and AI decisions.
 *
 * Responsibilities:
 * - Select AI moves.
 * - Evaluate moves.
 * - Choose switches.
 * - Evaluate matchups.
 * - Predict battle outcomes.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Manage battle state.
 * - Handle rewards.
 */

"use strict";





class BattleAIService {



    constructor()
    {


        this.difficulties =
        {

            EASY:
            {
                randomness:
                    0.7
            },


            NORMAL:
            {
                randomness:
                    0.4
            },


            HARD:
            {
                randomness:
                    0.1
            }


        };


    }









    //--------------------------------
    // Choose move
    //--------------------------------


    chooseMove(
        pokemon,
        opponent,
        moves,
        difficulty = "NORMAL"
    )
    {


        if(
            !moves ||
            moves.length === 0
        )
        {

            return null;

        }








        const settings =
            this.getDifficulty(

                difficulty

            );








        if(
            Math.random()
            <
            settings.randomness
        )
        {

            return moves[

                Math.floor(

                    Math.random()

                    *

                    moves.length

                )

            ];

        }








        return this.getBestMove(

            pokemon,

            opponent,

            moves

        );


    }









    //--------------------------------
    // Best move
    //--------------------------------


    getBestMove(
        pokemon,
        opponent,
        moves
    )
    {


        let best =
            moves[0];


        let score =
            -1;








        for(
            const move of moves
        )
        {


            const value =
                this.evaluateMove(

                    pokemon,

                    opponent,

                    move

                );








            if(
                value > score
            )
            {

                score =
                    value;


                best =
                    move;

            }


        }








        return best;


    }









    //--------------------------------
    // Evaluate move
    //--------------------------------


    evaluateMove(
        pokemon,
        opponent,
        move
    )
    {


        if(
            typeof move === "string"
        )
        {

            return 1;

        }








        let score =
            0;








        score +=

            move.power

            ||

            0;








        if(
            move.accuracy
        )
        {

            score *=

                move.accuracy / 100;

        }








        if(
            move.effectiveness
        )
        {

            score *=

                move.effectiveness;

        }








        return score;


    }









    //--------------------------------
    // Evaluate matchup
    //--------------------------------


    evaluateMatchup(
        attacker,
        defender
    )
    {


        let score =
            0;








        if(
            attacker.level >
            defender.level
        )
        {

            score += 10;

        }


        else
        {

            score -= 10;

        }








        if(
            attacker.type &&
            defender.type
        )
        {


            const result =
                this.typeAdvantage(

                    attacker.type,

                    defender.type

                );



            score += result;


        }








        return score;


    }









    //--------------------------------
    // Type advantage
    //--------------------------------


    typeAdvantage(
        attacker,
        defender
    )
    {


        const advantages =
        {

            FIRE:
            [
                "GRASS",
                "ICE",
                "BUG"
            ],


            WATER:
            [
                "FIRE",
                "GROUND",
                "ROCK"
            ],


            ELECTRIC:
            [
                "WATER",
                "FLYING"
            ],


            GRASS:
            [
                "WATER",
                "GROUND",
                "ROCK"
            ]

        };








        if(
            advantages[attacker]
            &&
            advantages[attacker].includes(

                defender

            )
        )
        {

            return 20;

        }








        return 0;


    }









    //--------------------------------
    // Predict winner
    //--------------------------------


    predictBattle(
        playerTeam,
        opponentTeam
    )
    {


        let playerScore =
            0;


        let opponentScore =
            0;








        for(
            const player of playerTeam
        )
        {


            for(
                const opponent of opponentTeam
            )
            {


                const result =
                    this.evaluateMatchup(

                        player,

                        opponent

                    );



                if(
                    result > 0
                )
                {

                    playerScore += result;

                }

                else
                {

                    opponentScore += Math.abs(result);

                }


            }


        }








        return {


            winner:

                playerScore >= opponentScore

                ?

                "PLAYER"

                :

                "OPPONENT",


            playerScore,


            opponentScore


        };


    }









    //--------------------------------
    // Switch logic
    //--------------------------------


    shouldSwitch(
        activePokemon
    )
    {


        if(
            !activePokemon
        )
        {

            return false;

        }








        return (

            activePokemon.hp <= 0

        );


    }









    //--------------------------------
    // Choose switch Pokemon
    //--------------------------------


    chooseSwitch(
        team
    )
    {


        return team.find(

            pokemon =>

                pokemon.hp > 0

        )

        ||

        null;


    }









    //--------------------------------
    // Difficulty
    //--------------------------------


    getDifficulty(
        level
    )
    {

        return (

            this.difficulties[level]

            ||

            this.difficulties.NORMAL

        );

    }



}





module.exports =
    BattleAIService;