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
 * - Calculate damage.
 * - Execute move mechanics.
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


        const validation =

            this.validation.validateMove(

                player,

                playerMove

            );





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









        //--------------------------------
        // Select enemy move
        //--------------------------------


        let enemyMove = null;





        if(
            this.ai
        )
        {
        
            const enemyMoves =
        
                this.pokemon.getUsableMoves
        
                ?
        
                this.pokemon.getUsableMoves(
                    enemy
                )
            
                :
            
                enemy.moves;
            
            
            enemyMove =
            
                this.ai.chooseMove(
                
                    enemy,
                
                    player,
                
                    enemyMoves
                
                );
            
        }









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
            
                    player.species,
            
            
                hp:
            
                    player.hp
            
            },
        
        
            enemy:
            {
            
                pokemon:
            
                    enemy.species,
            
            
                hp:
            
                    enemy.hp
            
            },
        
        
            actions:
        
                []
        
        };









        //--------------------------------
        // Execute actions
        //--------------------------------


        for(
            const action of actions
        )
        {


            const attacker =

                this.pokemon.getActivePokemon(

                    action.side

                );





            if(
                this.pokemon.isFainted(

                    attacker

                )
            )
            {

                continue;

            }









            const defenderSide =

                action.side === battle.player

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
            )
            {

                continue;

            }









            this.turn.executeTurnMove(

                action.side,

                defenderSide,

                action.move,

                result,

                battle,

                side =>

                    this.pokemon.getActivePokemon(

                        side

                    )

            );









            //--------------------------------
            // Faint checks
            //--------------------------------


            this.faint.handleFaint(

                action.side,

                result

            );





            this.faint.handleFaint(

                defenderSide,

                result

            );









            //--------------------------------
            // Battle end
            //--------------------------------


            this.result.checkBattleEnd(

                battle

            );









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
            
        result.player.hp =
            player.hp;
            
            
        result.enemy.hp =
            enemy.hp;









        //--------------------------------
        // End turn effects
        //--------------------------------


        if(
            battle.status ===
            "ACTIVE"
        )
        {


            this.turn.processEndTurn(

                battle,

                result,

                side =>

                    this.pokemon.getActivePokemon(

                        side

                    )

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









        this.result.checkBattleEnd(

            battle

        );









        return {

            success:true,

            result

        };


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