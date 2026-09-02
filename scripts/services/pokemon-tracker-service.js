/**
 * Pokémon Companion
 * Pokémon Tracker Service
 *
 * Manages user's tracked Pokémon collection.
 *
 * Responsibilities:
 * - Add Pokémon to tracker.
 * - Remove Pokémon from tracker.
 * - Update Pokémon progress.
 * - Mark Pokémon as seen/caught.
 * - Find tracked Pokémon.
 * - Provide collection summaries.
 * - Preserve individual Pokémon state.
 *
 * Does NOT:
 * - Calculate EXP.
 * - Handle battles.
 * - Handle evolution.
 * - Recommend teams.
 * - Load ROM data.
 * - Execute friendship mechanics.
 */

"use strict";





class PokemonTrackerService {



    constructor()
    {


        this.pokemon =
            [];


        this.nextId =
            1;


    }









    //--------------------------------
    // Add Pokemon
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
                    "Missing Pokemon"

            };

        }


        if(
            !pokemon.species
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon species"

            };

        }








        //--------------------------------
        // Preserve individual Pokémon
        // state.
        //--------------------------------

        const trackedPokemon =
        {

            ...pokemon,


            //--------------------------------
            // Tracker-specific ID
            //--------------------------------

            trackerId:

                this.nextId++,


            //--------------------------------
            // Preserve existing Pokémon ID
            // when one exists.
            //--------------------------------

            id:

                pokemon.id
                ??
                null,


            species:

                pokemon.species,


            nickname:

                pokemon.nickname
                ??
                null,


            level:

                pokemon.level
                ??
                1,


            exp:

                pokemon.exp
                ??
                0,


            friendship:

                pokemon.friendship
                ??
                70,


            ball:

                pokemon.ball
                ??
                pokemon.captureBall
                ??
                null,


            metLocation:

                pokemon.metLocation
                ??
                pokemon.location
                ??
                null,


            moves:

                Array.isArray(
                    pokemon.moves
                )

                ?

                pokemon.moves

                :

                [],


            seen:

                pokemon.seen
                ??
                true,


            caught:

                pokemon.caught
                ??
                true,


            favorite:

                pokemon.favorite
                ??
                false

        };








        this.pokemon.push(

            trackedPokemon

        );








        return {


            success:true,


            pokemon:

                trackedPokemon


        };


    }









    //--------------------------------
    // Remove Pokemon
    //--------------------------------


    removePokemon(
        id
    )
    {


        const index =
            this.findIndexById(
                id
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
            this.pokemon.splice(

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
    // Get all tracked Pokemon
    //--------------------------------


    getAll()
    {

        return this.pokemon;

    }









    //--------------------------------
    // Find Pokemon
    //--------------------------------


    findPokemon(
        species
    )
    {


        if(
            !species
        )
        {

            return [];

        }


        return this.pokemon.filter(

            pokemon =>

                pokemon.species ===

                String(
                    species
                ).toUpperCase()

        );


    }









    //--------------------------------
    // Get by ID
    //--------------------------------


    getPokemon(
        id
    )
    {


        //--------------------------------
        // Support tracker ID
        //--------------------------------

        const trackerPokemon =
            this.pokemon.find(

                pokemon =>

                    pokemon.trackerId ===
                    id

            );


        if(
            trackerPokemon
        )
        {

            return trackerPokemon;

        }


        //--------------------------------
        // Support Pokémon ID
        //--------------------------------

        return this.pokemon.find(

            pokemon =>

                pokemon.id ===
                id

        )

        ||

        null;

    }









    //--------------------------------
    // Find internal index
    //--------------------------------


    findIndexById(
        id
    )
    {


        const trackerIndex =
            this.pokemon.findIndex(

                pokemon =>

                    pokemon.trackerId ===
                    id

            );


        if(
            trackerIndex !== -1
        )
        {

            return trackerIndex;

        }


        return this.pokemon.findIndex(

            pokemon =>

                pokemon.id ===
                id

        );

    }









    //--------------------------------
    // Update Pokemon
    //--------------------------------


    updatePokemon(
        id,
        updates
    )
    {


        const pokemon =
            this.getPokemon(

                id

            );








        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Pokemon not found"

            };

        }








        if(
            !updates
            ||
            typeof updates !==
                "object"
        )
        {

            return {

                success:false,

                reason:
                    "Invalid updates"

            };

        }








        Object.assign(

            pokemon,

            updates

        );








        //--------------------------------
        // Normalize friendship after an
        // update when one is supplied.
        //--------------------------------

        if(
            updates.friendship !==
                undefined
        )
        {

            const friendship =
                Number(
                    updates.friendship
                );


            if(
                Number.isFinite(
                    friendship
                )
            )
            {

                pokemon.friendship =
                    Math.min(

                        255,

                        Math.max(

                            0,

                            Math.floor(
                                friendship
                            )

                        )

                    );

            }

        }








        return {


            success:true,


            pokemon


        };


    }









    //--------------------------------
    // Mark favorite
    //--------------------------------


    favoritePokemon(
        id
    )
    {


        const pokemon =
            this.getPokemon(

                id

            );








        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Pokemon not found"

            };

        }








        pokemon.favorite =
            true;








        return {


            success:true,


            pokemon


        };


    }









    //--------------------------------
    // Mark seen
    //--------------------------------


    markSeen(
        species
    )
    {


        const pokemon =
            this.findPokemon(

                species

            );








        pokemon.forEach(

            item =>

                item.seen = true

        );








        return {


            success:true,


            count:

                pokemon.length


        };


    }









    //--------------------------------
    // Count different caught species
    //--------------------------------

    getCaughtSpeciesCount()
    {

        const species =
            new Set();


        for(
            const pokemon of
                this.pokemon
        )
        {

            if(
                !pokemon
                ||
                !pokemon.caught
                ||
                !pokemon.species
            )
            {

                continue;

            }


            species.add(
                pokemon.species
            );

        }


        return species.size;

    }









    //--------------------------------
    // Collection summary
    //--------------------------------


    getSummary()
    {


        return {


            total:

                this.pokemon.length,


            caught:

                this.pokemon.filter(

                    pokemon =>

                        pokemon.caught

                ).length,


            favorites:

                this.pokemon.filter(

                    pokemon =>

                        pokemon.favorite

                ).length


        };


    }



}





module.exports =
    PokemonTrackerService;