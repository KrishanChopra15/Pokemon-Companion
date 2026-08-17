/**
 * Pokémon Companion
 * Capture Service
 *
 * Handles Pokémon capture logic.
 *
 * Responsibilities:
 * - Calculate capture chance.
 * - Process Poké Ball attempts.
 * - Return capture results.
 *
 * Does NOT:
 * - Generate encounters.
 * - Handle battles.
 * - Manage inventory.
 * - Manage party storage.
 * - Load ROM data.
 */

"use strict";





class CaptureService {



    constructor()
    {


        this.ballRates =
        {

            POKEBALL:
                1,


            GREATBALL:
                1.5,


            ULTRABALL:
                2,


            MASTERBALL:
                Infinity


        };


    }









    //--------------------------------
    // Calculate capture chance
    //--------------------------------


    calculateChance(
        pokemon,
        ball = "POKEBALL"
    )
    {


        if(
            !pokemon
        )
        {

            return 0;

        }








        const catchRate =
            pokemon.catchRate

            ||

            45;








        const hp =
            pokemon.hp

            ||

            1;








        const maxHP =
            pokemon.maxHP

            ||

            hp;








        const ballRate =
            this.ballRates[ball]

            ||

            1;








        const hpFactor =

            (

                (3 * maxHP)

                -

                (2 * hp)

            )

            *

            catchRate

            *

            ballRate;








        const chance =

            hpFactor

            /

            (3 * maxHP);








        return Math.min(

            255,

            Math.floor(chance)

        );


    }









    //--------------------------------
    // Attempt capture
    //--------------------------------


    attemptCapture(
        pokemon,
        ball = "POKEBALL"
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }








        if(
            ball === "MASTERBALL"
        )
        {

            return {


                success:true,


                captured:

                    pokemon.species,


                ball


            };

        }








        const chance =
            this.calculateChance(

                pokemon,

                ball

            );








        const roll =
            Math.floor(

                Math.random() * 256

            );








        return {


            success:true,


            captured:

                roll <= chance,


            pokemon:

                pokemon.species,


            ball,


            chance,


            roll


        };


    }









    //--------------------------------
    // Capture summary
    //--------------------------------


    createSummary(
        pokemon,
        result
    )
    {


        return {


            pokemon:

                pokemon.species,


            captured:

                result.captured,


            ball:

                result.ball


        };


    }



}





module.exports =
    CaptureService;