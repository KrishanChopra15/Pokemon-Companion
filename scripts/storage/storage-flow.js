/**
 * Pokémon Companion
 * Storage Flow
 *
 * Coordinates PC storage operations.
 *
 * Responsibilities:
 * - Store Pokémon in PC.
 * - Remove Pokémon from PC.
 * - Move Pokémon between party and PC.
 * - Provide storage status.
 *
 * Does NOT:
 * - Capture Pokémon.
 * - Manage party limits.
 * - Execute battles.
 */

"use strict";





class StorageFlow {



    constructor(
        storageManager,
        teamFlow = null
    )
    {


        this.storage =
            storageManager;


        this.team =
            teamFlow;


    }









    //--------------------------------
    // Store Pokémon
    //--------------------------------


    storePokemon(
        pokemon
    )
    {


        return this.storage
            .addPokemon(
                pokemon
            );


    }









    //--------------------------------
    // Remove Pokémon
    //--------------------------------


    removePokemon(
        id
    )
    {


        return this.storage
            .removePokemon(
                id
            );


    }









    //--------------------------------
    // Find Pokémon
    //--------------------------------


    findPokemon(
        id
    )
    {


        return this.storage
            .findPokemon(
                id
            );


    }









    //--------------------------------
    // Withdraw Pokémon from PC
    //--------------------------------


    withdrawPokemon(
        id
    )
    {


        const pokemon =
            this.storage
                .findPokemon(
                    id
                );



        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Pokemon not found"

            };

        }








        if(
            !this.team
        )
        {

            return {

                success:false,

                reason:
                    "Team unavailable"

            };

        }








        const added =
            this.team
                .addToTeam(
                    pokemon
                );








        if(
            !added.success
        )
        {

            return added;

        }








        const removed =
            this.storage
                .removePokemon(
                    id
                );








        return {

            success:true,

            pokemon,

            removed

        };


    }









    //--------------------------------
    // Deposit Pokémon to PC
    //--------------------------------


    depositPokemon(
        pokemon
    )
    {


        const stored =
            this.storage
                .addPokemon(
                    pokemon
                );



        if(
            !stored.success
        )
        {

            return stored;

        }








        return {

            success:true,

            pokemon:
                stored.pokemon

        };


    }









    //--------------------------------
    // Storage list
    //--------------------------------


    getStorage()
    {


        return this.storage
            .getStorage();


    }









    //--------------------------------
    // Status
    //--------------------------------


    getStatus()
    {


        return {


            count:

                this.storage
                    .getCount(),



            storage:

                this.storage
                    .getStorage()


        };


    }



}




module.exports =
    StorageFlow;