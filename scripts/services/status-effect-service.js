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
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate battle damage.
 * - Manage battles.
 * - Handle rewards.
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





            BADLY_POISONED:
            {

                toxic:
                    true,


                damageFraction:
                    1 / 16

            },





            BURN:
            {

                damageFraction:
                    1 / 16

            },





            PARALYSIS:
            {

                speedReduction:
                    0.5,


                immobilizeChance:
                    0.25

            },





            SLEEP:
            {

                minTurns:
                    1,


                maxTurns:
                    3

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








        pokemon.status =
            status;





        pokemon.statusData =
        {

            toxicCounter:
                0

        };








        //--------------------------------
        // Sleep duration
        //--------------------------------


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
        {

            toxicCounter:
                0

        };





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

        return (

            pokemon.status === status

        );


    }









    //--------------------------------
    // Get status
    //--------------------------------


    getStatus(
        pokemon
    )
    {

        return (

            pokemon.status

            ||

            null

        );


    }









    //--------------------------------
    // Process end turn effects
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

                damage:0,

                status:null

            };

        }








        let damage =
            0;



        const effect =
            this.effects[pokemon.status];









        //--------------------------------
        // Poison / Burn damage
        //--------------------------------


        if(
            effect.damageFraction
        )
        {


            let fraction =
                effect.damageFraction;








            //--------------------------------
            // Toxic scaling
            //--------------------------------


            if(
                pokemon.status === "BADLY_POISONED"
            )
            {


                if(
                    !pokemon.statusData
                )
                {

                    pokemon.statusData =
                    {

                        toxicCounter:
                            0

                    };

                }




                pokemon.statusData.toxicCounter++;




                fraction =

                    effect.damageFraction *

                    pokemon.statusData.toxicCounter;


            }








            damage =

                Math.max(

                    1,

                    Math.floor(

                        pokemon.maxHP

                        ?

                        pokemon.maxHP * fraction

                        :

                        pokemon.hp * fraction

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








        //--------------------------------
        // Sleep countdown
        //--------------------------------


        if(
            pokemon.status === "SLEEP"
        )
        {


            pokemon.statusTurns--;



            if(
                pokemon.statusTurns <= 0
            )
            {

                this.removeStatus(
                    pokemon
                );

            }


        }








        //--------------------------------
        // Freeze thaw check
        //--------------------------------


        if(
            pokemon.status === "FREEZE"
        )
        {


            if(
                Math.random()

                <=

                this.effects.FREEZE.thawChance

            )
            {

                this.removeStatus(

                    pokemon

                );

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
    // Can act
    //--------------------------------


    canAct(
        pokemon
    )
    {



        if(
            pokemon.status === "SLEEP"
        )
        {

            return false;

        }






        if(
            pokemon.status === "FREEZE"
        )
        {


            return Math.random()

                <=

                this.effects.FREEZE.thawChance;


        }








        if(
            pokemon.status === "PARALYSIS"
        )
        {


            return Math.random()

                >

                this.effects.PARALYSIS.immobilizeChance;


        }








        return true;


    }









    //--------------------------------
    // Random number
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