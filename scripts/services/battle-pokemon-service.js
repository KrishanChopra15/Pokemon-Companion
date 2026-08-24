/**
 * Pokémon Companion
 * Battle Pokémon Service
 *
 * Handles Pokémon helpers.
 *
 * Responsibilities:
 * - Initialize active slots.
 * - Get active Pokémon.
 * - Check faint status.
 * - Check alive Pokémon.
 * - Clone party.
 */

"use strict";





class BattlePokemonService {



    //--------------------------------
    // Initialize Pokémon state
    //--------------------------------


    initialize(
        battle
    )
    {


        if(
            !battle
        )
        {

            return false;

        }





        if(
            battle.player
        )
        {

            battle.player.active =

                battle.player.active
                ??
                0;

        }





        if(
            battle.opponent
        )
        {

            battle.opponent.active =

                battle.opponent.active
                ??
                0;

        }





        return true;


    }









    //--------------------------------
    // Get active Pokémon
    //--------------------------------


    getActivePokemon(
        side
    )
    {


        if(
            !side
            ||
            !Array.isArray(
                side.party
            )
        )
        {

            return null;

        }





        return (

            side.party[

                side.active || 0

            ]

            ||

            null

        );


    }









    //--------------------------------
    // Check faint
    //--------------------------------


    isFainted(
        pokemon
    )
    {


        return (

            !pokemon

            ||

            pokemon.hp <= 0

        );


    }









    //--------------------------------
    // Check alive
    //--------------------------------


    isAlive(
        pokemon
    )
    {


        return !!(

            pokemon

            &&

            pokemon.hp > 0

        );


    }









    //--------------------------------
    // Alive count
    //--------------------------------


    getAliveCount(
        party
    )
    {


        if(
            !Array.isArray(
                party
            )
        )
        {

            return 0;

        }





        return party.filter(

            pokemon =>

                this.isAlive(

                    pokemon

                )

        ).length;


    }









    //--------------------------------
    // Party alive
    //--------------------------------


    hasAlivePokemon(
        party
    )
    {


        return (

            this.getAliveCount(

                party

            ) > 0

        );


    }









    //--------------------------------
    // Clone
    //--------------------------------


    cloneParty(
        party
    )
    {

        return JSON.parse(

            JSON.stringify(

                party

            )

        );

    }


}





module.exports =
    BattlePokemonService;