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
 * - Preserve individual Pokémon state.
 * - Use the active adventure's storage.
 *
 * Does NOT:
 * - Decide when Pokémon enters storage.
 * - Handle captures.
 * - Handle team rules.
 */

"use strict";


class StorageManager
{

    constructor(session)
    {

        if(
            !session ||
            typeof session.getState !== "function"
        )
        {

            throw new Error(
                "StorageManager requires a valid session"
            );

        }


        this.session =
            session;

    }


    //--------------------------------
    // Get current adventure storage
    //--------------------------------

    getStorage()
    {

        const state =
            this.session.getState();


        if(
            !Array.isArray(state.storage)
        )
        {

            state.storage = [];

        }


        return state.storage;

    }


    //--------------------------------
    // Add Pokémon to storage
    //--------------------------------

    addPokemon(pokemon)
    {

        if(
            !pokemon ||
            !pokemon.species
        )
        {

            return {

                success: false,

                reason: "Invalid Pokemon"

            };

        }


        const storage =
            this.getStorage();


        //--------------------------------
        // Prevent duplicate storage entries
        //--------------------------------

        if(
            storage.some(
                storedPokemon =>
                    storedPokemon === pokemon ||
                    (
                        storedPokemon.id != null &&
                        pokemon.id != null &&
                        storedPokemon.id === pokemon.id
                    )
            )
        )
        {

            return {

                success: false,

                reason: "Pokemon already in storage"

            };

        }


        //--------------------------------
        // Assign an ID when necessary
        //--------------------------------

        if(
            pokemon.id == null
        )
        {

            const state =
                this.session.getState();


            if(
                !Number.isInteger(state.nextPokemonId) ||
                state.nextPokemonId < 1
            )
            {

                state.nextPokemonId = 1;

            }


            pokemon.id =
                state.nextPokemonId++;

        }


        //--------------------------------
        // Assign a PC box
        //
        // Preserve the original Pokémon
        // object and its existing properties.
        //--------------------------------

        pokemon.box =
            this.getNextBox();


        storage.push(
            pokemon
        );


        return {

            success: true,

            pokemon

        };

    }


    //--------------------------------
    // Remove Pokémon
    //--------------------------------

    removePokemon(id)
    {

        const storage =
            this.getStorage();


        const index =
            storage.findIndex(

                pokemon =>
                    pokemon.id === id

            );


        if(
            index === -1
        )
        {

            return {

                success: false,

                reason: "Pokemon not found"

            };

        }


        const removed =
            storage.splice(
                index,
                1
            )[0];


        return {

            success: true,

            pokemon: removed

        };

    }


    //--------------------------------
    // Find Pokémon
    //--------------------------------

    findPokemon(id)
    {

        return this.getStorage().find(

            pokemon =>
                pokemon.id === id

        );

    }


    //--------------------------------
    // Storage count
    //--------------------------------

    getCount()
    {

        return this.getStorage().length;

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
                this.getStorage().length / boxSize
            ) + 1;


        return "BOX_" + boxNumber;

    }

}


module.exports =
    StorageManager;