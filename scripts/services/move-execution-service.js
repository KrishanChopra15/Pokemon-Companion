/**
 * Pokémon Companion
 * Move Execution Service
 *
 * Handles Pokémon move execution.
 *
 * Responsibilities:
 * - Execute moves.
 * - Calculate damage.
 * - Apply damage.
 * - Handle accuracy.
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



    constructor()
    {


        this.defaultAccuracy =
            100;


    }









    //--------------------------------
    // Execute move
    //--------------------------------


    executeMove(
        attacker,
        defender,
        move
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
        // Accuracy
        //--------------------------------


        const accuracy =
            move.accuracy !== undefined
                ?
                move.accuracy
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

                message:
                    "Move missed"

            };

        }









        //--------------------------------
        // Damage
        //--------------------------------


        const damage =
            this.calculateDamage(

                attacker,

                defender,

                move

            );








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



            move:

                move.name



        };


    }









    //--------------------------------
    // Accuracy
    //--------------------------------


    checkAccuracy(
        accuracy
    )
    {


        const roll =
            Math.floor(

                Math.random() * 100

            )
            + 1;



        return roll <= accuracy;


    }









    //--------------------------------
    // Damage calculation
    //--------------------------------


    calculateDamage(
        attacker,
        defender,
        move
    )
    {


        const level =
            attacker.level
            ||
            1;



        const power =
            move.power
            ||
            0;





        if(
            power === 0
        )
        {

            return 0;

        }







        const damage =
            Math.floor(

                (

                    (

                        2 *

                        level

                    ) /

                    5

                    +

                    2

                )

                *

                power

                /

                10

            )

            + 1;





        return Math.max(

            damage,

            1

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

            pokemon.hp =
                0;

        }



        pokemon.hp -= damage;



        if(
            pokemon.hp < 0
        )
        {

            pokemon.hp =
                0;

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

            pokemon.hp <= 0

        );


    }









    //--------------------------------
    // Simple summary
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
                move.name,


            damage:
                result.damage,


            fainted:
                this.isFainted(
                    defender
                )


        };


    }



}





module.exports =
    MoveExecutionService;