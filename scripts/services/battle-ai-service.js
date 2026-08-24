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
 * - Select opponent moves.
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
    // Choose AI move
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









        //--------------------------------
        // Random move selection
        //--------------------------------


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









        //--------------------------------
        // Best move selection
        //--------------------------------


        return this.getBestMove(

            pokemon,

            opponent,

            moves

        );


    }









    //--------------------------------
    // Choose enemy move
    //--------------------------------


    chooseEnemyMove(
        pokemon,
        opponent,
        difficulty = "NORMAL"
    )
    {


        if(
            !pokemon
        )
        {

            return null;

        }





        const moves =
            pokemon.moves || [];





        const usableMoves =
            moves.filter(

                move =>

                    typeof move.pp !== "number"

                    ||

                    move.pp > 0

            );









        //--------------------------------
        // No usable moves
        // Use STRUGGLE
        //--------------------------------


        if(
            usableMoves.length === 0
        )
        {

            return this.getStruggleMove();

        }









        return this.chooseMove(

            pokemon,

            opponent,

            usableMoves,

            difficulty

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


        let bestScore =
            -1;









        for(
            const move of moves
        )
        {


            const score =

                this.evaluateMove(

                    pokemon,

                    opponent,

                    move

                );





            if(
                score >
                bestScore
            )
            {

                bestScore =
                    score;


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
            attacker.type
            &&
            defender.type
        )
        {


            score +=

                this.typeAdvantage(

                    attacker.type,

                    defender.type

                );


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
    // Predict battle
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

                    opponentScore +=

                        Math.abs(

                            result

                        );

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
    // Switch decision
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
    // Choose switch Pokémon
    //--------------------------------


    chooseSwitch(
        team
    )
    {


        if(
            !team
        )
        {

            return null;

        }





        return team.find(

            pokemon =>

                pokemon.hp > 0

        )

        ||

        null;


    }









    //--------------------------------
    // STRUGGLE fallback
    //--------------------------------


    getStruggleMove()
    {


        return {

            name:
                "STRUGGLE",


            constant:
                "MOVE_STRUGGLE",


            type:
                "NORMAL",


            category:
                "PHYSICAL",


            power:
                50,


            accuracy:
                100,


            priority:
                0,


            pp:
                1,


            maxPP:
                1

        };


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