/**
 * Pokémon Companion
 * Capture Manager
 *
 * Stores captured Pokémon records.
 *
 * Responsibilities:
 * - Store captures.
 * - Remove captures.
 * - Find captured Pokémon.
 *
 * Does NOT:
 * - Handle capture probability.
 * - Consume Poké Balls.
 * - Handle battles.
 */

"use strict";





class CaptureManager {



    constructor()
    {

        this.captures =
            [];

    }









    //--------------------------------
    // Add Capture
    //--------------------------------


    addCapture(
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









        const capture =
        {

            id:

                Date.now(),


            species:

                pokemon.species,


            level:

                pokemon.level || 1,


            location:

                pokemon.location || null,


            capturedAt:

                new Date()
                    .toISOString()


        };









        this.captures.push(
            capture
        );









        return {

            success:true,

            capture

        };


    }









    //--------------------------------
    // Remove Capture
    //--------------------------------


    removeCapture(
        id
    )
    {


        const index =
            this.captures
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
                    "Capture not found"

            };

        }









        const removed =
            this.captures
                .splice(
                    index,
                    1
                )[0];



        return {

            success:true,

            capture:
                removed

        };


    }









    //--------------------------------
    // Get Captures
    //--------------------------------


    getCaptures()
    {

        return this.captures;

    }









    //--------------------------------
    // Find Capture
    //--------------------------------


    findCapture(
        species
    )
    {


        return this.captures
            .find(

                pokemon =>

                    pokemon.species === species

            );

    }



}





module.exports =
    CaptureManager;