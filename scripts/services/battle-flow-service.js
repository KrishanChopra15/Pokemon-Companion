/**
 * Pokémon Companion
 * Battle Flow Service
 *
 * Coordinates battle turn execution.
 *
 * Responsibilities:
 * - Run battle turns.
 * - Connect battle subsystems.
 *
 * Does NOT:
 * - Store battles.
 * - Store duplicate battle state.
 * - Calculate damage.
 * - Execute move mechanics directly.
 * - Manage ROM data.
 */

"use strict";


class BattleFlowService {


    constructor(
        validationService,
        turnOrderService,
        turnService,
        faintService,
        resultService,
        pokemonService,
        battleAIService
    )
    {

        this.validation =
            validationService;


        this.order =
            turnOrderService;


        this.turn =
            turnService;


        this.faint =
            faintService;


        this.result =
            resultService;


        this.pokemon =
            pokemonService;


        this.ai =
            battleAIService;

    }


    //--------------------------------
    // Process battle turn
    //--------------------------------

    processTurn(
        battle,
        playerMove
    )
    {

        //--------------------------------
        // Validate battle
        //--------------------------------

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
            battle.status !==
            "ACTIVE"
        )
        {

            return {

                success:false,

                reason:
                    "Battle finished"

            };

        }


        if(
            !battle.player
            ||
            !battle.opponent
        )
        {

            return {

                success:false,

                reason:
                    "Invalid battle participants"

            };

        }


        if(
            !this.pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Battle Pokémon service unavailable"

            };

        }


        //--------------------------------
        // Get active Pokémon
        //--------------------------------

        const player =

            this.pokemon.getActivePokemon(

                battle.player

            );


        const enemy =

            this.pokemon.getActivePokemon(

                battle.opponent

            );


        if(
            !player ||
            !enemy
        )
        {

            return {

                success:false,

                reason:
                    "Missing active Pokémon"

            };

        }


        //--------------------------------
        // Validate player move
        //--------------------------------

        if(
            !this.validation
        )
        {

            return {

                success:false,

                reason:
                    "Battle validation unavailable"

            };

        }


        let validation =

            this.validation.validateMove(

                player,

                playerMove

            );


        //--------------------------------
        // Automatic STRUGGLE
        //--------------------------------

        if(
            validation.struggle
        )
        {

            playerMove =
                this.getStruggleMove();

        }


        else if(
            !validation.success
        )
        {

            return validation;

        }


        else
        {

            playerMove =
                validation.move
                ||
                playerMove;

        }


        //--------------------------------
        // Select enemy move
        //--------------------------------

        let enemyMove =
            null;


        if(
            this.ai
        )
        {

            const enemyMoves =

                this.getUsableEnemyMoves(

                    enemy

                );


            enemyMove =

                this.ai.chooseMove(

                    enemy,

                    player,

                    enemyMoves

                );

        }


        //--------------------------------
        // Enemy has no usable move
        //--------------------------------

        if(
            !enemyMove
        )
        {

            enemyMove =
                this.getStruggleMove();

        }


        //--------------------------------
        // Determine turn order
        //--------------------------------

        if(
            !this.order
        )
        {

            return {

                success:false,

                reason:
                    "Turn order service unavailable"

            };

        }


        const actions =

            this.order.getTurnOrder(

                battle,

                playerMove,

                enemyMove

            );


        //--------------------------------
        // Turn result container
        //--------------------------------

        const result =
        {

            turn:
                battle.turn,


            player:
            {

                pokemon:
                    this.getPokemonName(
                        player
                    ),


                hp:
                    player.hp

            },


            enemy:
            {

                pokemon:
                    this.getPokemonName(
                        enemy
                    ),


                hp:
                    enemy.hp

            },


            actions:
                []

        };


        //--------------------------------
        // Execute ordered actions
        //--------------------------------

        for(
            const action of actions
        )
        {

            //--------------------------------
            // Resolve attacker side
            //--------------------------------

            const attackerSide =

                this.getBattleSide(

                    battle,

                    action.side

                );


            if(
                !attackerSide
            )
            {

                continue;

            }


            //--------------------------------
            // Resolve attacker Pokémon
            //--------------------------------

            const attacker =

                this.pokemon.getActivePokemon(

                    attackerSide

                );


            if(
                !attacker
                ||
                this.pokemon.isFainted(
                    attacker
                )
            )
            {

                continue;

            }


            //--------------------------------
            // Resolve defender side
            //--------------------------------

            const defenderSide =

                action.side === "PLAYER"

                ?

                battle.opponent

                :

                battle.player;


            const defender =

                this.pokemon.getActivePokemon(

                    defenderSide

                );


            if(
                !defender
                ||
                this.pokemon.isFainted(
                    defender
                )
            )
            {

                continue;

            }


            //--------------------------------
            // Execute move
            //--------------------------------

            if(
                !this.turn
            )
            {

                return {

                    success:false,

                    reason:
                        "Battle turn service unavailable"

                };

            }


            this.turn.executeTurnMove(

                action.side,

                action.side === "PLAYER"
                    ? "OPPONENT"
                    : "PLAYER",

                action.move,

                result,

                battle

            );


            //--------------------------------
            // Re-resolve sides after move
            //--------------------------------

            const currentAttackerSide =

                this.getBattleSide(

                    battle,

                    action.side

                );


            const currentDefenderSide =

                this.getBattleSide(

                    battle,

                    action.side === "PLAYER"
                    ? "OPPONENT"
                    : "PLAYER"

                );


            //--------------------------------
            // Handle attacker faint
            //--------------------------------

            if(
                this.faint
                &&
                currentAttackerSide
            )
            {

                this.faint.handleFaint(

                    currentAttackerSide,

                    result

                );

            }


            //--------------------------------
            // Handle defender faint
            //--------------------------------

            if(
                this.faint
                &&
                currentDefenderSide
            )
            {

                this.faint.handleFaint(

                    currentDefenderSide,

                    result

                );

            }


            //--------------------------------
            // Check battle end
            //--------------------------------

            if(
                this.result
            )
            {

                this.result.checkBattleEnd(

                    battle

                );

            }


            if(
                battle.status !==
                "ACTIVE"
            )
            {

                break;

            }

        }


        //--------------------------------
        // Update final HP snapshot
        //--------------------------------

        const currentPlayer =

            this.pokemon.getActivePokemon(

                battle.player

            );


        const currentEnemy =

            this.pokemon.getActivePokemon(

                battle.opponent

            );


        result.player.hp =

            currentPlayer
            ?
            currentPlayer.hp
            :
            0;


        result.enemy.hp =

            currentEnemy
            ?
            currentEnemy.hp
            :
            0;


        //--------------------------------
        // End turn effects
        //--------------------------------

        if(
            battle.status ===
            "ACTIVE"
            &&
            this.turn
        )
        {

            this.turn.processEndTurn(

                battle,

                result

            );

        }


        //--------------------------------
        // Check faint after end effects
        //--------------------------------

        if(
            battle.status ===
            "ACTIVE"
            &&
            this.faint
        )
        {

            this.faint.handleFaint(

                battle.player,

                result

            );


            this.faint.handleFaint(

                battle.opponent,

                result

            );

        }


        //--------------------------------
        // Advance turn
        //--------------------------------

        if(
            battle.status ===
            "ACTIVE"
        )
        {

            battle.turn++;

        }


        //--------------------------------
        // Final battle result check
        //--------------------------------

        if(
            this.result
        )
        {

            this.result.checkBattleEnd(

                battle

            );

        }


        return {

            success:true,

            result

        };

    }


    //--------------------------------
    // Resolve battle side
    //--------------------------------

    getBattleSide(
        battle,
        side
    )
    {

        if(
            !battle
        )
        {

            return null;

        }


        if(
            side ===
            "PLAYER"
        )
        {

            return battle.player;

        }


        if(
            side ===
            "OPPONENT"
        )
        {

            return battle.opponent;

        }


        return null;

    }


    //--------------------------------
    // Get usable enemy moves
    //--------------------------------

    getUsableEnemyMoves(
        pokemon
    )
    {

        if(
            !pokemon
            ||
            !Array.isArray(
                pokemon.moves
            )
        )
        {

            return [];

        }


        return pokemon.moves.filter(

            move =>

                typeof move.pp !==
                "number"

                ||

                move.pp > 0

        );

    }


    //--------------------------------
    // Pokémon name
    //--------------------------------

    getPokemonName(
        pokemon
    )
    {

        return (

            pokemon?.species

            ||

            pokemon?.name

            ||

            pokemon?.constant

            ||

            "UNKNOWN"

        );

    }


    //--------------------------------
    // Default STRUGGLE
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
                0

        };

    }


}


module.exports =
    BattleFlowService;