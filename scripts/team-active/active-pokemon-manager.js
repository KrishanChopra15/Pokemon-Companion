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



    constructor()
    {


        this.active =
            null;


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








        this.active =
            pokemon;








        return {

            success:true,

            pokemon:
                this.active

        };


    }









    //--------------------------------
    // Get active Pokémon
    //--------------------------------


    getActive()
    {


        return this.active;


    }









    //--------------------------------
    // Clear active
    //--------------------------------


    clear()
    {


        this.active =
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


        return this.active !== null;


    }



}





module.exports =
    ActivePokemonManager;