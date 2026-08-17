/**
 * Pokémon Companion
 * Starter Selection Service
 *
 * Handles player's starter choice.
 *
 * Responsibilities:
 * - Store selected starter.
 * - Resolve starter family.
 * - Block other starter families.
 * - Filter starter availability.
 *
 * Does NOT:
 * - Handle battles.
 * - Handle availability rules.
 * - Recommend teams.
 */

"use strict";





class StarterSelectionService {



    constructor()
    {


        this.starterFamilies =
        {

            BULBASAUR:
            [
                "BULBASAUR",
                "IVYSAUR",
                "VENUSAUR"
            ],


            CHARMANDER:
            [
                "CHARMANDER",
                "CHARMELEON",
                "CHARIZARD"
            ],


            SQUIRTLE:
            [
                "SQUIRTLE",
                "WARTORTLE",
                "BLASTOISE"
            ]

        };


    }









    //--------------------------------
    // Select starter
    //--------------------------------


    selectStarter(
        playerState,
        starter
    )
    {


        if(
            !this.starterFamilies[starter]
        )
        {

            return {

                success:false,

                reason:
                    "Invalid starter"

            };

        }





        playerState.starter =
            starter;





        return {

            success:true,

            starter

        };


    }









    //--------------------------------
    // Get selected starter
    //--------------------------------


    getStarter(
        playerState
    )
    {

        return (

            playerState.starter

            ||

            null

        );


    }









    //--------------------------------
    // Get family
    //--------------------------------


    getStarterFamily(
        starter
    )
    {

        return (

            this.starterFamilies[starter]

            ||

            []

        );


    }









    //--------------------------------
    // Get selected family
    //--------------------------------


    getSelectedStarterFamily(
        playerState
    )
    {


        const starter =
            this.getStarter(

                playerState

            );



        if(
            !starter
        )
        {

            return [];

        }



        return this.getStarterFamily(

            starter

        );


    }









    //--------------------------------
    // Get blocked Pokemon
    //--------------------------------


    getBlockedPokemon(
        playerState
    )
    {


        const selected =
            this.getStarter(

                playerState

            );



        if(
            !selected
        )
        {

            return [];

        }





        const blocked =
            [];





        Object.keys(

            this.starterFamilies

        )
        .forEach(

            starter =>

            {

                if(
                    starter !== selected
                )
                {

                    blocked.push(

                        ...

                        this.starterFamilies[starter]

                    );

                }

            }

        );





        return blocked;


    }









    //--------------------------------
    // Check Pokemon allowed
    //--------------------------------


    isAllowed(
        playerState,
        species
    )
    {


        const blocked =
            this.getBlockedPokemon(

                playerState

            );



        return (

            !blocked.includes(

                species

            )

        );


    }









    //--------------------------------
    // Check selected family
    //--------------------------------


    belongsToSelectedFamily(
        playerState,
        species
    )
    {


        const family =
            this.getSelectedStarterFamily(

                playerState

            );



        if(
            family.length === 0
        )
        {

            return true;

        }



        return family.includes(

            species

        );


    }









    //--------------------------------
    // Filter Pokemon list
    //--------------------------------


    filterAvailablePokemon(
        playerState,
        pokemonList
    )
    {


        if(
            !Array.isArray(
                pokemonList
            )
        )
        {

            return [];

        }





        return pokemonList.filter(

            pokemon =>

                this.isAllowed(

                    playerState,

                    pokemon.species || pokemon

                )

        );


    }



}





module.exports =
    StarterSelectionService;