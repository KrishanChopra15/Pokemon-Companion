/**
 * Pokémon Companion
 * Active Pokémon Manager
 *
 * Manages the currently selected battle Pokémon.
 *
 * Responsibilities:
 * - Set active Pokémon.
 * - Get active Pokémon.
 * - Clear active Pokémon.
 *
 * Does NOT:
 * - Manage full team.
 * - Handle battles.
 * - Calculate stats.
 */

"use strict";





class ActivePokemonManager {



    constructor(
        session
    )
    {


        this.session =
            session;


    }









    //--------------------------------
    // Set active Pokémon
    //--------------------------------


    setActive(
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








        this.session
            .getState()
            .activePokemon =
                pokemon;








        return {

            success:true,

            pokemon:
                pokemon

        };


    }









    //--------------------------------
    // Get active Pokémon
    //--------------------------------


    getActive()
    {


        return this.session
            .getState()
            .activePokemon;


    }









    //--------------------------------
    // Clear active
    //--------------------------------


    clear()
    {


        this.session
            .getState()
            .activePokemon =
                null;



        return {

            success:true

        };


    }









    //--------------------------------
    // Status
    //--------------------------------


    hasActive()
    {


        return this.session
            .getState()
            .activePokemon !==
                null;


    }



}





module.exports =
    ActivePokemonManager;