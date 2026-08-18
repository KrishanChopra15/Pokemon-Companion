/**
 * Pokémon Companion
 * Team Flow
 *
 * Coordinates player team decisions.
 *
 * Responsibilities:
 * - Add Pokémon to party.
 * - Remove Pokémon from party.
 * - Manage party order.
 *
 * Does NOT:
 * - Capture Pokémon.
 * - Handle battles.
 * - Calculate stats.
 */

"use strict";





class TeamFlow {



    constructor(
        teamManager
    )
    {


        this.team =
            teamManager;


    }









    //--------------------------------
    // Add Pokemon
    //--------------------------------


    addToTeam(
        pokemon
    )
    {


        return this.team
            .addPokemon(
                pokemon
            );


    }









    //--------------------------------
    // Remove Pokemon
    //--------------------------------


    removeFromTeam(
        species
    )
    {


        return this.team
            .removePokemon(
                species
            );


    }









    //--------------------------------
    // Swap team order
    //--------------------------------


    reorderTeam(
        first,
        second
    )
    {


        return this.team
            .swapPokemon(
                first,
                second
            );


    }









    //--------------------------------
    // Team status
    //--------------------------------


    getTeam()
    {


        return this.team
            .getTeam();


    }









    getStatus()
    {


        return {


            size:

                this.team
                    .getSize(),


            team:

                this.team
                    .getTeam()


        };


    }



}





module.exports =
    TeamFlow;