/**
 * Pokémon Companion
 * Storage Manager
 *
 * Stores Pokémon placed in PC boxes.
 *
 * Responsibilities:
 * - Store boxed Pokémon.
 * - Remove boxed Pokémon.
 * - Find stored Pokémon.
 * - Provide storage data.
 *
 * Does NOT:
 * - Decide when Pokémon enters storage.
 * - Handle captures.
 * - Handle team rules.
 */

"use strict";





class StorageManager {



    constructor()
    {

        this.storage = [];

    }









    //--------------------------------
    // Add Pokémon to storage
    //--------------------------------


    addPokemon(
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









        const storedPokemon =
        {

            id:

                Date.now(),


            species:

                pokemon.species,


            level:

                pokemon.level || 1,


            location:

                pokemon.location || null,


            box:

                this.getNextBox()


        };









        this.storage.push(
            storedPokemon
        );









        return {

            success:true,

            pokemon:
                storedPokemon

        };


    }









    //--------------------------------
    // Remove Pokémon
    //--------------------------------


    removePokemon(
        id
    )
    {


        const index =
            this.storage
                .findIndex(

                    pokemon =>

                        pokemon.id === id

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
            this.storage
                .splice(
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
    // Find Pokémon
    //--------------------------------


    findPokemon(
        id
    )
    {

        return this.storage
            .find(

                pokemon =>

                    pokemon.id === id

            );

    }









    //--------------------------------
    // Get all storage
    //--------------------------------


    getStorage()
    {

        return this.storage;

    }









    //--------------------------------
    // Storage count
    //--------------------------------


    getCount()
    {

        return this.storage.length;

    }









    //--------------------------------
    // Box calculation
    //--------------------------------


    getNextBox()
    {


        const boxSize =
            30;



        const boxNumber =
            Math.floor(

                this.storage.length /

                boxSize

            )

            +

            1;



        return (

            "BOX_" +

            boxNumber

        );


    }



}





module.exports =
    StorageManager;