/**
 * Pokémon Companion
 * Battle Engine Service
 *
 * Handles battle state and turn flow.
 *
 * Responsibilities:
 * - Manage active battle state.
 * - Process battle turns.
 * - Coordinate move execution.
 * - Handle fainting.
 * - Request Pokémon switching.
 * - Determine battle outcome.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute move mechanics.
 * - Manage trainer progression.
 * - Give rewards.
 * - Handle gym logic.
 * - Load ROM data.
 */

"use strict";





class BattleEngineService {



    constructor(
        moveExecutionService,
        pokemonSwitchService
    )
    {


        this.moves =
            moveExecutionService;



        this.switches =
            pokemonSwitchService;



        this.battles =
        {};

    }









    //--------------------------------
    // Initialize battle
    //--------------------------------


    initializeBattle(
        battle
    )
    {


        const state =
        {

            id:
                battle.id,


            status:
                "ACTIVE",



            player:
            {

                party:
                    this.cloneParty(
                        battle.player.party
                    ),


                active:
                    0

            },



            opponent:
            {

                party:
                    this.cloneParty(
                        battle.opponent.party
                    ),


                active:
                    0

            },



            turn:
                1,


            winner:
                null


        };



        this.battles[battle.id] =
            state;



        return state;


    }









    //--------------------------------
    // Get battle
    //--------------------------------


    getBattle(
        battleId
    )
    {

        return (

            this.battles[battleId]

            ||

            null

        );

    }









    //--------------------------------
    // Process turn
    //--------------------------------


    processTurn(
        battleId,
        playerMove,
        opponentMove
    )
    {


        const battle =
            this.getBattle(
                battleId
            );



        if(
            !battle
        )
        {

            return {

                success:false,

                reason:
                    "Unknown battle"

            };

        }






        if(
            battle.status !== "ACTIVE"
        )
        {

            return {

                success:false,

                reason:
                    "Battle already finished"

            };

        }








        const result =
        {

            turn:
                battle.turn,


            actions:
            []

        };









        //--------------------------------
        // Player turn
        //--------------------------------


        this.executeTurnMove(

            battle.player,

            battle.opponent,

            playerMove,

            result

        );









        this.handleFaint(

            battle.opponent,

            result

        );









        //--------------------------------
        // Opponent turn
        //--------------------------------


        if(
            battle.status === "ACTIVE"

            &&

            !this.isFainted(
                this.getActivePokemon(
                    battle.opponent
                )
            )

        )
        {


            this.executeTurnMove(

                battle.opponent,

                battle.player,

                opponentMove,

                result

            );



            this.handleFaint(

                battle.player,

                result

            );


        }








        battle.turn++;




        this.checkBattleEnd(

            battle

        );








        return {

            success:true,

            result

        };


    }









    //--------------------------------
    // Execute move wrapper
    //--------------------------------


    executeTurnMove(
        attackerSide,
        defenderSide,
        move,
        result
    )
    {


        const attacker =
            this.getActivePokemon(
                attackerSide
            );


        const defender =
            this.getActivePokemon(
                defenderSide
            );



        const moveResult =
            this.moves.executeMove(

                attacker,

                defender,

                move

            );



        result.actions.push(

            {

                attacker:
                    attacker.species,


                move:
                    moveResult.move,


                damage:
                    moveResult.damage,


                target:
                    defender.species,


                targetHP:
                    defender.hp

            }

        );


    }









    //--------------------------------
    // Handle faint
    //--------------------------------


    handleFaint(
        side,
        result
    )
    {


        const pokemon =
            this.getActivePokemon(
                side
            );



        if(
            !this.isFainted(
                pokemon
            )
        )
        {

            return;

        }






        if(
            this.switches
        )
        {


            const switchResult =
                this.switches.autoSwitch(

                    side

                );



            if(
                switchResult.success
            )
            {

                result.actions.push(

                    {

                        type:
                            "SWITCH",


                        pokemon:
                            switchResult.pokemon.species

                    }

                );


                return;

            }


        }



    }









    //--------------------------------
    // Active pokemon
    //--------------------------------


    getActivePokemon(
        side
    )
    {

        return side.party[

            side.active

        ];

    }









    //--------------------------------
    // Fainted
    //--------------------------------


    isFainted(
        pokemon
    )
    {

        return (

            !pokemon

            ||

            pokemon.hp <= 0

        );

    }









    //--------------------------------
    // Battle end
    //--------------------------------


    checkBattleEnd(
        battle
    )
    {


        const playerAlive =
            battle.player.party.some(

                pokemon =>

                    pokemon.hp > 0

            );



        const opponentAlive =
            battle.opponent.party.some(

                pokemon =>

                    pokemon.hp > 0

            );







        if(
            !opponentAlive
        )
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "PLAYER";

        }







        if(
            !playerAlive
        )
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "OPPONENT";

        }


    }









    //--------------------------------
    // Clone
    //--------------------------------


    cloneParty(
        party
    )
    {

        return JSON.parse(

            JSON.stringify(

                party

            )

        );

    }



}





module.exports =
    BattleEngineService;