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



    constructor(
        session
    )
    {


        this.session =
            session;


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








        const state =
            this.session
                .getState();


        //--------------------------------
        // Preserve individual Pokémon
        // state on the same object.
        //--------------------------------


        pokemon.trackerId =
            state.nextPokemonId++;


        pokemon.id =
            pokemon.id
            ??
            null;


        pokemon.species =
            pokemon.species;


        pokemon.nickname =
            pokemon.nickname
            ??
            null;


        pokemon.level =
            pokemon.level
            ??
            1;


        pokemon.exp =
            pokemon.exp
            ??
            0;


        pokemon.friendship =
            pokemon.friendship
            ??
            70;


        pokemon.ball =
            pokemon.ball
            ??
            pokemon.captureBall
            ??
            null;


        pokemon.metLocation =
            pokemon.metLocation
            ??
            pokemon.location
            ??
            null;


        pokemon.moves =
            Array.isArray(
                pokemon.moves
            )
            ?
            pokemon.moves
            :
            [];


        pokemon.seen =
            pokemon.seen
            ??
            true;


        pokemon.caught =
            pokemon.caught
            ??
            true;


        pokemon.favorite =
            pokemon.favorite
            ??
            false;








        //--------------------------------
        // Store the same Pokémon object
        // in the session.
        //--------------------------------


        state.pokemon.push(
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
        id
    )
    {


        const state =
            this.session
                .getState();


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


        const index =
            state.pokemon.indexOf(
                pokemon
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
            state.pokemon.splice(

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


        return this.session
            .getState()
            .pokemon;


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


        const pokemon =
            this.session
                .getState()
                .pokemon;


        return pokemon.filter(

            item =>

                item.species ===

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


        const pokemon =
            this.session
                .getState()
                .pokemon;


        //--------------------------------
        // Support tracker ID
        //--------------------------------


        const trackerPokemon =
            pokemon.find(

                item =>

                    item.trackerId ===
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


        return pokemon.find(

            item =>

                item.id ===
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


        const pokemon =
            this.session
                .getState()
                .pokemon;


        const trackerIndex =
            pokemon.findIndex(

                item =>

                    item.trackerId ===
                    id

            );


        if(
            trackerIndex !== -1
        )
        {

            return trackerIndex;

        }


        return pokemon.findIndex(

            item =>

                item.id ===
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


        const pokemon =
            this.session
                .getState()
                .pokemon;


        for(
            const item of
                pokemon
        )
        {

            if(
                !item
                ||
                !item.caught
                ||
                !item.species
            )
            {

                continue;

            }


            species.add(
                item.species
            );

        }


        return species.size;


    }









    //--------------------------------
    // Collection summary
    //--------------------------------


    getSummary()
    {


        const pokemon =
            this.session
                .getState()
                .pokemon;


        return {

            total:
                pokemon.length,

            caught:
                pokemon.filter(

                    item =>

                        item.caught

                ).length,

            favorites:
                pokemon.filter(

                    item =>

                        item.favorite

                ).length

        };


    }







}





module.exports =
    PokemonTrackerService;