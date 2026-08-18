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
 *
 * Does NOT:
 * - Capture Pokémon.
 * - Execute battles.
 * - Calculate stats.
 * - Handle evolution.
 */

"use strict";





class TeamManager {



    constructor()
    {

        this.team = [];

        this.maxSize = 6;

    }









    //--------------------------------
    // Add Pokemon
    //--------------------------------


    addPokemon(
        pokemon
    )
    {


        if(
            this.team.length >= this.maxSize
        )
        {

            return {

                success:false,

                reason:
                    "Team is full"

            };

        }








        this.team.push(
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
        species
    )
    {


        const index =
            this.team.findIndex(

                pokemon =>

                    pokemon.species === species

            );



        if(
            index === -1
        )
        {

            return {

                success:false,

                reason:
                    "Pokemon not found"

            };

        }








        const removed =
            this.team.splice(

                index,

                1

            )[0];








        return {

            success:true,

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


        if(
            !this.team[first] ||
            !this.team[second]
        )
        {

            return {

                success:false,

                reason:
                    "Invalid position"

            };

        }








        const temp =
            this.team[first];



        this.team[first] =
            this.team[second];



        this.team[second] =
            temp;








        return {

            success:true,

            team:
                this.team

        };


    }









    //--------------------------------
    // Get Team
    //--------------------------------


    getTeam()
    {

        return this.team;

    }









    //--------------------------------
    // Check Team
    //--------------------------------


    hasPokemon(
        species
    )
    {


        return this.team.some(

            pokemon =>

                pokemon.species === species

        );


    }









    getSize()
    {

        return this.team.length;

    }









    clear()
    {

        this.team = [];


        return {

            success:true

        };


    }



}





module.exports =
    TeamManager;