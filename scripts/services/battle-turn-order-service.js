/**
 * Pokémon Companion
 * Battle Turn Order Service
 *
 * Handles battle action ordering.
 *
 * Responsibilities:
 * - Compare move priority.
 * - Compare Pokémon speed.
 * - Handle speed ties.
 * - Apply speed modifiers.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Modify battle state.
 * - Store Pokémon state.
 */

"use strict";


class BattleTurnOrderService {


    constructor(
        battlePokemonService = null
    )
    {

        this.battlePokemon =
            battlePokemonService;

    }


    //--------------------------------
    // Determine turn order
    //--------------------------------

    getTurnOrder(
        battle,
        playerMove,
        enemyMove
    )
    {

        if(
            !battle
            ||
            !battle.player
            ||
            !battle.opponent
        )
        {

            return [];

        }


        const player =

            this.battlePokemon

            ?

            this.battlePokemon.getActivePokemon(

                battle.player

            )

            :

            null;


        const enemy =

            this.battlePokemon

            ?

            this.battlePokemon.getActivePokemon(

                battle.opponent

            )

            :

            null;


        const playerPriority =

            this.getMovePriority(

                playerMove

            );


        const enemyPriority =

            this.getMovePriority(

                enemyMove

            );


        //--------------------------------
        // Player has higher priority
        //--------------------------------

        if(
            playerPriority >
            enemyPriority
        )
        {

            return [

                {

                    side:
                        "PLAYER",


                    move:
                        playerMove

                },


                {

                    side:
                        "OPPONENT",


                    move:
                        enemyMove

                }

            ];

        }


        //--------------------------------
        // Opponent has higher priority
        //--------------------------------

        if(
            enemyPriority >
            playerPriority
        )
        {

            return [

                {

                    side:
                        "OPPONENT",


                    move:
                        enemyMove

                },


                {

                    side:
                        "PLAYER",


                    move:
                        playerMove

                }

            ];

        }


        //--------------------------------
        // Compare speed
        //--------------------------------

        const playerSpeed =

            this.getSpeed(

                player

            );


        const enemySpeed =

            this.getSpeed(

                enemy

            );


        //--------------------------------
        // Player is faster
        //--------------------------------

        if(
            playerSpeed >
            enemySpeed
        )
        {

            return [

                {

                    side:
                        "PLAYER",


                    move:
                        playerMove

                },


                {

                    side:
                        "OPPONENT",


                    move:
                        enemyMove

                }

            ];

        }


        //--------------------------------
        // Opponent is faster
        //--------------------------------

        if(
            enemySpeed >
            playerSpeed
        )
        {

            return [

                {

                    side:
                        "OPPONENT",


                    move:
                        enemyMove

                },


                {

                    side:
                        "PLAYER",


                    move:
                        playerMove

                }

            ];

        }


        //--------------------------------
        // Speed tie
        //--------------------------------

        if(
            Math.random() < 0.5
        )
        {

            return [

                {

                    side:
                        "PLAYER",


                    move:
                        playerMove

                },


                {

                    side:
                        "OPPONENT",


                    move:
                        enemyMove

                }

            ];

        }


        return [

            {

                side:
                    "OPPONENT",


                move:
                    enemyMove

            },


            {

                side:
                    "PLAYER",


                move:
                    playerMove

            }

        ];

    }


    //--------------------------------
    // Move priority
    //--------------------------------

    getMovePriority(
        move
    )
    {

        if(
            !move
        )
        {

            return 0;

        }


        return (

            typeof move.priority ===
            "number"

            ?

            move.priority

            :

            0

        );

    }


    //--------------------------------
    // Get Pokémon speed
    //--------------------------------

    getSpeed(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return 0;

        }


        let speed =
            pokemon.speed;


        if(
            typeof speed !==
            "number"
        )
        {

            speed =
                pokemon.stats?.speed
                ||
                1;

        }


        const stage =
            pokemon.statStages?.speed
            ||
            0;


        speed =
            this.applyStatStage(

                speed,

                stage

            );


        //--------------------------------
        // Paralysis
        //--------------------------------

        if(
            pokemon.status ===
            "PARALYSIS"
        )
        {

            speed =
                Math.floor(

                    speed * 0.25

                );

        }


        return Math.max(

            1,

            Math.floor(
                speed
            )

        );

    }


    //--------------------------------
    // Apply stat stage
    //--------------------------------

    applyStatStage(
        stat,
        stage
    )
    {

        const stages =
        {

            "-6":
                2 / 8,

            "-5":
                2 / 7,

            "-4":
                2 / 6,

            "-3":
                2 / 5,

            "-2":
                2 / 4,

            "-1":
                2 / 3,

            "0":
                1,

            "1":
                3 / 2,

            "2":
                4 / 2,

            "3":
                5 / 2,

            "4":
                6 / 2,

            "5":
                7 / 2,

            "6":
                8 / 2

        };


        const safeStage =

            Math.max(

                -6,

                Math.min(

                    6,

                    stage || 0

                )

            );


        return Math.floor(

            stat *

            stages[

                String(
                    safeStage
                )

            ]

        );

    }


}


module.exports =
    BattleTurnOrderService;