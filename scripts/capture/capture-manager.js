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
 * - Preserve captured Pokémon metadata.
 *
 * Does NOT:
 * - Handle capture probability.
 * - Consume Poké Balls.
 * - Handle battles.
 * - Execute friendship mechanics.
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


            metLocation:

                pokemon.metLocation
                ||
                pokemon.location
                ||
                null,


            friendship:

                pokemon.friendship !== undefined

                ?

                pokemon.friendship

                :

                null,


            ball:

                pokemon.ball
                ||
                pokemon.captureBall
                ||
                null,


            nickname:

                pokemon.nickname
                ||
                null,


            exp:

                pokemon.exp
                ||
                0,


            moves:

                Array.isArray(
                    pokemon.moves
                )

                ?

                pokemon.moves

                :

                [],


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

                    pokemon.species ===
                    species

            );

    }



}





module.exports =
    CaptureManager;