/**
 * Pokémon Companion
 * Battle Pokémon Service
 *
 * Provides battle Pokémon utilities.
 *
 * Responsibilities:
 * - Get active Pokémon.
 * - Check faint status.
 * - Check alive status.
 * - Count alive Pokémon.
 *
 * Does NOT:
 * - Manage active Pokémon state.
 * - Handle switching.
 * - Store battle state.
 * - Clone parties.
 */

"use strict";





class BattlePokemonService {



    //--------------------------------
    // Get active Pokémon
    //--------------------------------


    getActivePokemon(
        side
    )
    {


        if(
            !side ||
            !Array.isArray(
                side.party
            )
        )
        {

            return null;

        }





        const activeIndex =
            side.active ?? 0;





        return (

            side.party[

                activeIndex

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

            !pokemon ||

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

            pokemon &&

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
    // Check party alive
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



}





module.exports =
    BattlePokemonService;