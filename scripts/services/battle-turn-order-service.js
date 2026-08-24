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
 */

"use strict";


class BattleTurnOrderService {



    //--------------------------------
    // Determine turn order
    //--------------------------------

    getTurnOrder(
        battle,
        playerMove,
        enemyMove
    )
    {


        const player =
            this.getActivePokemon(

                battle.player

            );


        const enemy =
            this.getActivePokemon(

                battle.opponent

            );





        const playerPriority =
            this.getMovePriority(

                playerMove

            );


        const enemyPriority =
            this.getMovePriority(

                enemyMove

            );





        //--------------------------------
        // Priority check
        //--------------------------------

        if(
            playerPriority >
            enemyPriority
        )
        {

            return [

                {
                    side:
                        battle.player,

                    move:
                        playerMove

                },


                {
                    side:
                        battle.opponent,

                    move:
                        enemyMove

                }

            ];

        }





        if(
            enemyPriority >
            playerPriority
        )
        {

            return [

                {
                    side:
                        battle.opponent,

                    move:
                        enemyMove

                },


                {
                    side:
                        battle.player,

                    move:
                        playerMove

                }

            ];

        }





        //--------------------------------
        // Speed check
        //--------------------------------

        const playerSpeed =
            this.getSpeed(

                player

            );


        const enemySpeed =
            this.getSpeed(

                enemy

            );





        if(
            playerSpeed >
            enemySpeed
        )
        {

            return [

                {
                    side:
                        battle.player,

                    move:
                        playerMove

                },


                {
                    side:
                        battle.opponent,

                    move:
                        enemyMove

                }

            ];

        }





        if(
            enemySpeed >
            playerSpeed
        )
        {

            return [

                {
                    side:
                        battle.opponent,

                    move:
                        enemyMove

                },


                {
                    side:
                        battle.player,

                    move:
                        playerMove

                }

            ];

        }





        //--------------------------------
        // Speed tie
        //--------------------------------

        return Math.random() < 0.5

        ?

        [

            {
                side:
                    battle.player,

                move:
                    playerMove

            },


            {
                side:
                    battle.opponent,

                move:
                    enemyMove

            }

        ]

        :

        [

            {
                side:
                    battle.opponent,

                move:
                    enemyMove

            },


            {
                side:
                    battle.player,

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

            typeof move.priority === "number"

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
            typeof speed !== "number"
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

            Math.floor(speed)

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









    //--------------------------------
    // Get active Pokémon
    //--------------------------------

    getActivePokemon(
        side
    )
    {


        if(
            !side
            ||
            !side.party
        )
        {

            return null;

        }





        return (

            side.party[

                side.active || 0

            ]

            ||

            null

        );


    }


}





module.exports =
    BattleTurnOrderService;