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
        pokemonSwitchService,
        battleStateFlow,
        battleActiveFlow,
        battleOpponentFlow,
        battleAIService,
        pokemonProgressionService
    )
    {


        this.moves =
            moveExecutionService;


        this.switches =
            pokemonSwitchService;


        this.state =
            battleStateFlow;


        this.active =
            battleActiveFlow;


        this.opponent =
            battleOpponentFlow;


        this.ai =
            battleAIService;

            
        this.progression =
            pokemonProgressionService;


        this.battles =
        {};

    }









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
                    battle.player.party,


                active:
                    0

            },


            opponent:
            {

                party:
                    battle.opponent.party,


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



        if(this.state)
        {

            this.state.setPlayer(
                state.player.party[
                    state.player.active
                ]
            );


            this.state.setEnemy(
                state.opponent.party[
                    state.opponent.active
                ]
            );

        }



        if(this.active)
        {

            this.active.sendOut(
                state.player.party[
                    state.player.active
                ]
            );

        }



        if(this.opponent)
        {

            this.opponent.sendOut(
                state.opponent.party[
                    state.opponent.active
                ]
            );

        }



        return state;


    }









    getBattle(
        battleId
    )
    {

        return this.battles[battleId] || null;

    }









    processTurn(
        battleId,
        playerMove
    )
    {


        const battle =
            this.getBattle(
                battleId
            );



        if(!battle)
        {

            return {

                success:false,

                reason:"Unknown battle"

            };

        }



        if(
            battle.status !== "ACTIVE"
        )
        {

            return {

                success:false,

                reason:"Battle finished"

            };

        }



        const result =
        {

            turn:
                battle.turn,


            actions:
                []

        };







        // PLAYER TURN

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







        // OPPONENT TURN

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


            const enemy =
                this.getActivePokemon(
                    battle.opponent
                );


            const player =
                this.getActivePokemon(
                    battle.player
                );



            const enemyMoves =
                enemy.moves
                ||
                [];



            const opponentMove =
                this.ai
                ?
                this.ai.chooseMove(
                    enemy,
                    player,
                    enemyMoves
                )
                :
                enemyMoves[0];




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





        if(this.state)
        {

            this.state.startTurn();


            this.state.record(
                result
            );

        }





        this.checkBattleEnd(
            battle
        );





        return {

            success:true,

            result

        };


    }









    executeTurnMove(
        attackerSide,
        defenderSide,
        move,
        result
    )
    {


        if(!move)
        {
            return;
        }



        const attacker =
            this.getActivePokemon(
                attackerSide
            );


        const defender =
            this.getActivePokemon(
                defenderSide
            );



        if(
            !attacker ||
            !defender
        )
        {

            return;

        }





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
                    moveResult.move
                    ||
                    move.name,


                damage:
                    moveResult.damage
                    ||
                    0,


                target:
                    defender.species,


                targetHP:
                    defender.hp

            }

        );


    }









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



        if(this.switches)
        {


            const switched =
                this.switches.autoSwitch(
                    side
                );



            if(
                switched.success
            )
            {

                result.actions.push(

                    {

                        type:
                            "SWITCH",


                        pokemon:
                            switched.pokemon.species

                    }

                );


            }


        }


    }









    getActivePokemon(
        side
    )
    {

        return side.party[
            side.active
        ];

    }









    isFainted(
        pokemon
    )
    {

        return (
            !pokemon ||
            pokemon.hp <= 0
        );

    }









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



        if(!opponentAlive)
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "PLAYER";

        }



        if(!playerAlive)
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "OPPONENT";

        }



        if(this.state)
        {

            this.state.updateStatus(
                battle.status
            );

        }


    }









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