/**
 * Pokémon Companion
 * Active Pokémon Flow
 *
 * Coordinates active battle Pokémon.
 *
 * Responsibilities:
 * - Select active Pokémon.
 * - Switch active Pokémon.
 * - Provide active status.
 *
 * Does NOT:
 * - Manage party.
 * - Execute battles.
 */

"use strict";





class ActivePokemonFlow {



    constructor(
        activeManager,
        teamFlow
    )
    {


        this.active =
            activeManager;


        this.team =
            teamFlow;


    }









    //--------------------------------
    // Select active Pokémon
    //--------------------------------


   selectActive(
        pokemon
    )
    {


        if (
            !pokemon ||
            !pokemon.species
        )
        {
            return {
                success: false,
                reason: "Invalid Pokemon"
            };
        }
        
        
        const team =
            this.team
                .getTeam();
        
        
        const exists =
            team.some(
                member =>
                    member === pokemon ||
                    (
                        pokemon.id != null &&
                        member.id === pokemon.id
                    ) ||
                    (
                        pokemon.trackerId != null &&
                        member.trackerId === pokemon.trackerId
                    )
            );



        if(
            !exists
        )
        {

            return {

                success:false,

                reason:
                    "Pokemon not in team"

            };

        }








        return this.active
            .setActive(
                pokemon
            );


    }









    //--------------------------------
    // Get active Pokémon
    //--------------------------------


    getActive()
    {


        return this.active
            .getActive();


    }









    //--------------------------------
    // Clear active
    //--------------------------------


    clearActive()
    {


        return this.active
            .clear();


    }









    //--------------------------------
    // Status
    //--------------------------------


    getStatus()
    {


        return {


            active:

                this.active
                    .getActive(),


            hasActive:

                this.active
                    .hasActive()


        };


    }



}





module.exports =
    ActivePokemonFlow;