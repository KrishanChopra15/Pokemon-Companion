/**
 * Pokémon Companion
 * Status Effect Service
 *
 * Handles Pokémon status conditions.
 *
 * Responsibilities:
 * - Apply status effects.
 * - Remove status effects.
 * - Check active status.
 * - Handle turn based effects.
 * - Apply status damage.
 * - Handle status counters.
 * - Provide battle modifiers.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate battle damage.
 * - Manage battles.
 */

"use strict";





class StatusEffectService {



    constructor()
    {


        this.effects =
        {


            POISON:
            {

                damageFraction:
                    1 / 8

            },





            BAD_POISON:
            {

                toxic:
                    true,


                damageFraction:
                    1 / 16

            },





            BURN:
            {

                damageFraction:
                    1 / 8,


                attackMultiplier:
                    0.5

            },





            PARALYSIS:
            {

                speedMultiplier:
                    0.25,


                immobilizeChance:
                    0.25

            },





            SLEEP:
            {

                minTurns:
                    1,


                maxTurns:
                    7

            },





            FREEZE:
            {

                thawChance:
                    0.2

            }



        };


    }









    //--------------------------------
    // Apply status
    //--------------------------------


    inflict(
        pokemon,
        status
    )
    {


        return this.applyStatus(

            pokemon,

            status

        );


    }









    applyStatus(
        pokemon,
        status
    )
    {


        if(
            !this.effects[status]
        )
        {

            return {

                success:false,

                reason:
                    "Unknown status"

            };

        }



        //--------------------------------
        // Major status cannot overwrite
        //--------------------------------


        if(
            pokemon.status
        )
        {

            return {

                success:false,

                reason:
                    "Already has status"

            };

        }





        pokemon.status =
            status;



        pokemon.statusData =
        {

            toxicCounter:
                0

        };








        if(
            status === "SLEEP"
        )
        {

            pokemon.statusTurns =

                this.randomNumber(

                    this.effects.SLEEP.minTurns,

                    this.effects.SLEEP.maxTurns

                );

        }







        return {

            success:true,

            status

        };


    }









    //--------------------------------
    // Remove status
    //--------------------------------


    removeStatus(
        pokemon
    )
    {


        pokemon.status =
            null;


        pokemon.statusTurns =
            0;


        pokemon.statusData =
            null;



        return {

            success:true

        };


    }









    //--------------------------------
    // Check status
    //--------------------------------


    hasStatus(
        pokemon,
        status
    )
    {


        return pokemon.status === status;


    }









    getStatus(
        pokemon
    )
    {


        return pokemon.status || null;


    }









    //--------------------------------
    // End turn damage
    //--------------------------------


    processTurn(
        pokemon
    )
    {


        if(
            !pokemon.status
        )
        {

            return {

                success:true,

                damage:0

            };

        }





        let damage = 0;



        const effect =
            this.effects[pokemon.status];





        if(
            effect.damageFraction
        )
        {


            let fraction =
                effect.damageFraction;





            if(
                pokemon.status === "BAD_POISON"
            )
            {


                pokemon.statusData ??=
                {

                    toxicCounter:0

                };



                pokemon.statusData.toxicCounter++;



                fraction *=

                    pokemon.statusData.toxicCounter;


            }






            damage =
                    
                Math.max(
                
                    1,
                
                    Math.floor(
                    
                        (pokemon.maxHP || pokemon.hp) *
                    
                        fraction
                    
                    )
                
                );



            pokemon.hp -= damage;



            if(
                pokemon.hp < 0
            )
            {

                pokemon.hp = 0;

            }


        }








        return {

            success:true,

            status:
                pokemon.status,

            damage


        };


    }









    //--------------------------------
    // Can move
    //--------------------------------


    canAct(
        pokemon
    )
    {


        switch(
            pokemon.status
        )
        {


            case "SLEEP":


                pokemon.statusTurns--;



                if(
                    pokemon.statusTurns <= 0
                )
                {

                    this.removeStatus(
                        pokemon
                    );


                    return true;

                }


                return false;





            case "FREEZE":


                if(
                    Math.random()

                    <=

                    this.effects.FREEZE.thawChance

                )
                {

                    this.removeStatus(
                        pokemon
                    );


                    return true;

                }


                return false;





            case "PARALYSIS":


                return (

                    Math.random()

                    >

                    this.effects.PARALYSIS.immobilizeChance

                );





            default:

                return true;


        }


    }









    //--------------------------------
    // Battle modifiers
    //--------------------------------


    getSpeedMultiplier(
        pokemon
    )
    {


        if(
            pokemon.status === "PARALYSIS"
        )
        {

            return 0.25;

        }



        return 1;


    }









    getAttackMultiplier(
        pokemon
    )
    {


        if(
            pokemon.status === "BURN"
        )
        {

            return 0.5;

        }



        return 1;


    }









    //--------------------------------
    // Random
    //--------------------------------


    randomNumber(
        min,
        max
    )
    {


        return Math.floor(

            Math.random()

            *

            (

                max -

                min +

                1

            )

        )

        +

        min;


    }









    //--------------------------------
    // Status list
    //--------------------------------


    getAllStatuses()
    {

        return Object.keys(

            this.effects

        );


    }



}





module.exports =
    StatusEffectService;