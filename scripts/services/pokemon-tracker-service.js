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
 *
 * Does NOT:
 * - Calculate EXP.
 * - Handle battles.
 * - Handle evolution.
 * - Recommend teams.
 * - Load ROM data.
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








        const trackedPokemon =
        {

            id:

                this.nextId++,


            species:

                pokemon.species,


            nickname:

                pokemon.nickname || null,


            level:

                pokemon.level || 1,


            exp:

                pokemon.exp || 0,


            moves:

                pokemon.moves || [],


            seen:

                true,


            caught:

                true,


            favorite:

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
            this.pokemon.findIndex(

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


        return this.pokemon.filter(

            pokemon =>

                pokemon.species ===

                species.toUpperCase()

        );


    }









    //--------------------------------
    // Get by ID
    //--------------------------------


    getPokemon(
        id
    )
    {


        return this.pokemon.find(

            pokemon =>

                pokemon.id === id

        )

        ||

        null;


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








        Object.assign(

            pokemon,

            updates

        );








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