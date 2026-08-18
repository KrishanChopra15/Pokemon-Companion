/**
 * Pokémon Companion
 * Capture Flow
 *
 * Handles player-confirmed Pokémon captures.
 *
 * Responsibilities:
 * - Record captured Pokémon.
 * - Update Pokémon tracker.
 * - Create capture actions.
 *
 * Does NOT:
 * - Detect captures automatically.
 * - Execute capture mechanics.
 * - Handle battles.
 */

"use strict";





class CaptureFlow {



    constructor(
        captureService,
        pokemonTracker,
        actionFlow
    )
    {


        this.captureService =
            captureService;


        this.tracker =
            pokemonTracker;


        this.actions =
            actionFlow;


    }









    //--------------------------------
    // Confirm capture
    //--------------------------------


    confirmCapture(
        pokemon
    )
    {


        if(
            !pokemon ||
            !pokemon.species
        )
        {

            return {

                success:false,

                reason:
                    "Invalid Pokemon"

            };

        }








        const tracked =
            this.tracker
                .addPokemon({

                    species:
                        pokemon.species,


                    nickname:
                        pokemon.nickname || null,


                    level:
                        pokemon.level || 1,


                    location:
                        pokemon.location || null


                });








        if(
            !tracked.success
        )
        {

            return tracked;

        }








        const action =
            this.actions
                .capturePokemon(

                    pokemon.species,


                    pokemon.level || 1,


                    pokemon.location || null

                );








        return {

            success:true,


            pokemon:

                tracked.pokemon,


            action:

                action.action


        };


    }









    //--------------------------------
    // Remove capture
    //--------------------------------


    removeCapture(
        id
    )
    {


        return this.tracker
            .removePokemon(
                id
            );


    }









    //--------------------------------
    // Captured list
    //--------------------------------


    getCapturedPokemon()
    {


        return this.tracker
            .getAll();


    }



}





module.exports =
    CaptureFlow;