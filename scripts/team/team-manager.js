/**
 * Pokémon Companion
 * Team Manager
 *
 * Manages the player's active Pokémon party.
 *
 * Responsibilities:
 * - Store active team.
 * - Add Pokémon.
 * - Remove Pokémon.
 * - Swap Pokémon positions.
 * - Check team capacity.
 * - Preserve individual Pokémon state.
 *
 * Does NOT:
 * - Capture Pokémon.
 * - Execute battles.
 * - Calculate stats.
 * - Handle evolution.
 * - Copy or strip Pokémon state.
 */

"use strict";





class TeamManager {



    constructor(
        session
    )
    {

        this.session =
            session;

        this.maxSize =
            6;

    }









    //--------------------------------
    // Add Pokemon
    //
    // Stores the same Pokémon object.
    // This preserves:
    // - friendship
    // - capture ball
    // - met location
    // - moves
    // - PP state
    // - evolution history
    // - other individual state
    //--------------------------------


    addPokemon(
        pokemon
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Invalid Pokemon"

            };

        }








        const team =
            this.session
                .getState()
                .team;


        if(
            team.length >= this.maxSize
        )
        {

            return {

                success:false,

                reason:
                    "Team is full"

            };

        }








        team.push(
            pokemon
        );








        return {

            success:true,

            pokemon

        };


    }









    //--------------------------------
    // Remove Pokemon
    //--------------------------------

    removePokemon(
        target
    )
    {

        const team =
            this.session
                .getState()
                .team;


        const index =
            team.findIndex(

                pokemon =>
                {

                    // Match the exact Pokémon object.
                    if(
                        target &&
                        typeof target === "object"
                    )
                    {

                        return (
                            pokemon === target ||
                            (
                                target.id != null &&
                                pokemon.id === target.id
                            )
                        );

                    }


                    // Match a numeric Pokémon ID.
                    if(
                        typeof target === "number"
                    )
                    {

                        return pokemon.id === target;

                    }


                    // Preserve the existing
                    // species-based behavior.
                    return pokemon.species === target;

                }

            );


        if(
            index === -1
        )
        {

            return {

                success: false,

                reason:
                    "Pokemon not found"

            };

        }


        const removed =
            team.splice(

                index,

                1

            )[0];


        return {

            success: true,

            pokemon:
                removed

        };

    }









    //--------------------------------
    // Swap Pokemon
    //--------------------------------


    swapPokemon(
        first,
        second
    )
    {


        const team =
            this.session
                .getState()
                .team;


        if(
            !team[first] ||
            !team[second]
        )
        {

            return {

                success:false,

                reason:
                    "Invalid position"

            };

        }








        const temp =
            team[first];



        team[first] =
            team[second];



        team[second] =
            temp;








        return {

            success:true,

            team:
                team

        };


    }









    //--------------------------------
    // Get Team
    //--------------------------------


    getTeam()
    {


        return this.session
            .getState()
            .team;


    }









    //--------------------------------
    // Check Team
    //--------------------------------


    hasPokemon(
        species
    )
    {


        const team =
            this.session
                .getState()
                .team;


        return team.some(

            pokemon =>

                pokemon.species === species

        );


    }









    getSize()
    {


        return this.session
            .getState()
            .team
            .length;


    }









    clear()
    {


        const team =
            this.session
                .getState()
                .team;


        team.length =
            0;


        return {

            success:true

        };


    }



}





module.exports =
    TeamManager;