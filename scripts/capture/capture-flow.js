/**
 * Pokémon Companion
 * Capture Flow
 *
 * Handles player-confirmed Pokémon captures.
 *
 * Responsibilities:
 * - Validate capture.
 * - Consume capture items.
 * - Store captured Pokémon.
 * - Update tracker.
 * - Add Pokémon to team.
 * - Send overflow Pokémon to PC storage.
 * - Create actions.
 *
 * Does NOT:
 * - Detect wild encounters.
 * - Execute battle mechanics.
 */

"use strict";





class CaptureFlow {



    constructor(
        captureService,
        captureManager,
        teamFlow,
        storageFlow,
        inventoryFlow,
        pokemonTracker,
        actionFlow
    )
    {


        this.captureService =
            captureService;


        this.captures =
            captureManager;


        this.team =
            teamFlow;


        this.storage =
            storageFlow;


        this.inventory =
            inventoryFlow;


        this.tracker =
            pokemonTracker;


        this.actions =
            actionFlow;


    }









    //--------------------------------
    // Confirm Capture
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









        //--------------------------------
        // Check Pokeball
        //--------------------------------


        if(
            !this.inventory
                .hasItem(
                    "POKE_BALL"
                )
        )
        {

            return {

                success:false,

                reason:
                    "No Poke Balls available"

            };

        }









        //--------------------------------
        // Consume Pokeball
        //--------------------------------


        const usedBall =
            this.inventory
                .useItem(
                    "POKE_BALL"
                );



        if(
            !usedBall.success
        )
        {

            return usedBall;

        }









        const pokemonData =
        {

            species:
                pokemon.species,


            level:
                pokemon.level || 1,


            location:
                pokemon.location || null


        };









        //--------------------------------
        // Store Capture History
        //--------------------------------


        const captured =
            this.captures
                .addCapture(
                    pokemonData
                );



        if(
            !captured.success
        )
        {

            return captured;

        }








        const storedPokemon =
            captured.capture ||
            captured.pokemon ||
            pokemonData;









        //--------------------------------
        // Update Tracker
        //--------------------------------


        const tracked =
            this.tracker
                .addPokemon(
                    pokemonData
                );









        //--------------------------------
        // Add To Team
        //--------------------------------


        let teamResult =
        {

            success:false,

            reason:
                "Team Full"

        };



        if(
            this.team
            &&
            this.team.addToTeam
        )
        {

            teamResult =
                this.team
                    .addToTeam({

                        species:
                            pokemon.species,


                        level:
                            pokemon.level || 1

                    });

        }









        //--------------------------------
        // Overflow Storage
        //--------------------------------


        let storageResult =
        {

            success:false,

            reason:
                "Added To Team"

        };



        if(
            !teamResult.success
        )
        {


            if(
                this.storage
                &&
                this.storage.storePokemon
            )
            {

                storageResult =
                    this.storage
                        .storePokemon(
                            pokemonData
                        );

            }
            else
            {

                storageResult =
                {

                    success:false,

                    reason:
                        "Storage unavailable"

                };

            }


        }









        //--------------------------------
        // Action History
        //--------------------------------


        const action =
            this.actions
                .capturePokemon(

                    pokemon.species,

                    pokemon.level || 1,

                    pokemon.location || null

                );









        return {


            success:true,


            capture:
                storedPokemon,


            tracked:
                tracked.success,


            team:
                teamResult.success,


            stored:
                storageResult.success,


            storage:
                storageResult,


            action:
                action.action


        };


    }









    //--------------------------------
    // Remove Capture
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
    // Captured Pokémon List
    //--------------------------------


    getCapturedPokemon()
    {

        return this.captures
            .getCaptures();

    }



}





module.exports =
    CaptureFlow;