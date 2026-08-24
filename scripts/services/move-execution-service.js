/**
 * Pokémon Companion
 * Move Execution Service
 *
 * Handles Pokémon move execution.
 *
 * Responsibilities:
 * - Resolve special move mechanics.
 * - Execute moves.
 * - Calculate damage.
 * - Apply damage.
 * - Apply move effects.
 * - Handle accuracy.
 * - Handle status restrictions.
 * - Return move results.
 *
 * Does NOT:
 * - Control turns.
 * - Decide battle winner.
 * - Manage battle state.
 * - Handle trainer AI.
 */

"use strict";





class MoveExecutionService {



    constructor(
        moveMechanicsService = null,
        moveEffectService = null,
        damageCalculationService = null,
        statusEffectService = null
    )
    {


        this.moveMechanics =
            moveMechanicsService;



        this.moveEffect =
            moveEffectService;



        this.damageCalculation =
            damageCalculationService;



        this.statusEffect =
            statusEffectService;



        this.defaultAccuracy =
            100;


    }









    //--------------------------------
    // Execute move
    //--------------------------------


    executeMove(
        attacker,
        defender,
        move,
        context = {}
    )
    {


        if(
            !attacker ||
            !defender ||
            !move
        )
        {

            return {

                success:false,

                reason:
                    "Invalid move data"

            };

        }









        //--------------------------------
        // Status restriction check
        //--------------------------------


        if(
            this.statusEffect
        )
        {


            if(
                !this.statusEffect.canAct(
                    attacker
                )
            )
            {

                return {

                    success:true,

                    hit:false,

                    damage:0,

                    move:
                        move.name
                        ||
                        move.constant,


                    message:
                        "Unable to move due to status"

                };

            }


        }









        //--------------------------------
        // Resolve move mechanics
        //--------------------------------


        let resolvedMove =
            move;



        if(
            this.moveMechanics
        )
        {

            resolvedMove =

                this.moveMechanics.resolveMove(

                    move,

                    {

                        pokemon:
                            attacker,


                        weather:
                            context.weather,


                        environment:
                            context.environment

                    }

                );

        }








        if(
            !resolvedMove
        )
        {

            return {

                success:false,

                reason:
                    "Unable to resolve move"

            };

        }









        //--------------------------------
        // Accuracy
        //--------------------------------


        const accuracy =

            resolvedMove.accuracy !== undefined

            ?

            resolvedMove.accuracy

            :

            this.defaultAccuracy;





        const hit =

            this.checkAccuracy(

                accuracy

            );





        if(
            !hit
        )
        {

            return {

                success:true,

                hit:false,

                damage:0,


                move:

                    resolvedMove.name

                    ||

                    resolvedMove.constant,


                message:

                    "Move missed"

            };

        }









        //--------------------------------
        // Apply move effect
        //--------------------------------


        let effectResult =
            null;



        if(
            resolvedMove.effect
            &&
            this.moveEffect
        )
        {

            effectResult =

                this.moveEffect.applyEffect(

                    resolvedMove,

                    attacker,

                    defender,

                    context.battle

                );








            //--------------------------------
            // Ignore invalid empty effects
            //--------------------------------


            if(
                effectResult
                &&
                effectResult.success === false
            )
            {

                effectResult =
                    null;

            }


        }









        //--------------------------------
        // Apply direct status
        //--------------------------------


        let statusResult = null;


        if(
            resolvedMove.status
            &&
            this.statusEffect
        )
        {
        
            statusResult =
        
                this.statusEffect.applyStatus(
                
                    defender,
                
                    resolvedMove.status
                
                );
            
        }







        //--------------------------------
        // Status / utility move
        //--------------------------------


        const power =

            resolvedMove.power

            ||

            0;


        if(
            power === 0
        )
        {
        
            return {
            
                success:true,
            
                hit:true,
            
                damage:0,
            
            
                remainingHP:
            
                    defender.hp,
            
            
                effect:
                {
                
                    moveEffect:
                        effectResult,
                
                
                    status:
                        statusResult
                
                },
            
            
                move:
            
                    resolvedMove.name
            
                    ||
            
                    resolvedMove.constant,
            
            
                resolvedMove
            
            };
        
        }









        //--------------------------------
        // Calculate damage
        //--------------------------------


        let damage =
            1;



        if(
            this.damageCalculation
        )
        {

            console.log(
            {
                damageCalculatorConnected:true,
            
                attacker:
                    attacker.species,
            
                defender:
                    defender.species,
            
                move:
                    resolvedMove.name
            });
        
        
            damage =
        
            this.damageCalculation.calculateDamage(
                attacker,
                defender,
                resolvedMove,
                context
            );

        }









        //--------------------------------
        // Apply damage
        //--------------------------------


        this.applyDamage(

            defender,

            damage

        );









        return {

            success:true,

            hit:true,

            damage,


            remainingHP:

                defender.hp,


            effect:
            {
            
                moveEffect:
                    effectResult,
            
            
                status:
                    statusResult
            
            },


            move:

                resolvedMove.name

                ||

                resolvedMove.constant,


            resolvedMove

        };


    }









    //--------------------------------
    // Accuracy
    //--------------------------------


    checkAccuracy(
        accuracy
    )
    {


        if(
            accuracy >= 100
        )
        {

            return true;

        }



        if(
            accuracy <= 0
        )
        {

            return false;

        }



        const roll =

            Math.floor(

                Math.random() * 100

            )

            + 1;



        return (

            roll <= accuracy

        );


    }









    //--------------------------------
    // Apply damage
    //--------------------------------


    applyDamage(
        pokemon,
        damage
    )
    {


        if(
            typeof pokemon.hp !== "number"
        )
        {

            pokemon.hp = 0;

        }



        pokemon.hp -= damage;



        if(
            pokemon.hp < 0
        )
        {

            pokemon.hp = 0;

        }



        return pokemon.hp;


    }









    //--------------------------------
    // Check faint
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
    // Summary
    //--------------------------------


    getResultSummary(
        attacker,
        defender,
        move,
        result
    )
    {


        return {

            attacker:

                attacker.species,


            defender:

                defender.species,


            move:

                result.move

                ||

                move.name

                ||

                move.constant,


            damage:

                result.damage

                ||

                0,


            fainted:

                this.isFainted(

                    defender

                )

        };


    }



}





module.exports =
    MoveExecutionService;