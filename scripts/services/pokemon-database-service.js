/**
 * Pokémon Companion
 * Pokémon Database Service
 *
 * Provides access to generated Pokémon databases.
 *
 * Responsibilities:
 * - Load Pokémon database.
 * - Query Pokémon data.
 * - Query evolution data.
 *
 * Does NOT:
 * - Parse source files.
 * - Generate databases.
 * - Build databases.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class PokemonDatabaseService {



    constructor(
        game
    )
    {


        const databasePath =
            path.join(

                __dirname,

                "../../database/generated",

                game,

                "pokemon-species.json"

            );





        this.pokemon =
            JSON.parse(

                fs.readFileSync(

                    databasePath,

                    "utf8"

                )

            );


    }









    //--------------------------------
    // Get Pokemon
    //--------------------------------


    getPokemon(
        name
    )
    {


        return this.pokemon.find(

            pokemon =>

                pokemon.name ===

                name.toUpperCase()

        )

        ||

        null;


    }









    //--------------------------------
    // Get Pokemon by ID
    //--------------------------------


    getPokemonById(
        id
    )
    {


        const formattedId =
            String(id)

            .padStart(

                4,

                "0"

            );





        return this.pokemon.find(

            pokemon =>

                pokemon.id === formattedId

        )

        ||

        null;


    }









    //--------------------------------
    // Get all Pokemon
    //--------------------------------


    getAllPokemon()
    {

        return this.pokemon;

    }









    //--------------------------------
    // Get evolution data
    //--------------------------------


    getEvolution(
        species
    )
    {


        const pokemon =
            this.getPokemon(

                species

            );








        if(
            !pokemon
            ||
            !pokemon.evolutions
            ||
            pokemon.evolutions.length === 0
        )
        {

            return null;

        }








        const evolution =
            pokemon.evolutions[0];








        let method =
            null;








        switch(
            evolution.method.constant
        )
        {


            case "EVO_LEVEL":

                method =
                    "LEVEL";

                break;




            case "EVO_ITEM":

                method =
                    "ITEM";

                break;




            case "EVO_TRADE":

                method =
                    "TRADE";

                break;




            default:

                return null;


        }








        return {


            method,


            value:

                evolution.level

                ||

                null,



            target:

                evolution.targetSpecies.name

        };


    }









    //--------------------------------
    // Type search
    //--------------------------------


    getByType(
        type
    )
    {


        const searchType =
            type.toLowerCase();





        return this.getAllPokemon()

            .filter(

                pokemon =>


                    (

                        pokemon.type1 &&

                        pokemon.type1.name

                        .toLowerCase()

                        ===

                        searchType

                    )


                    ||

                    (

                        pokemon.type2 &&

                        pokemon.type2.name

                        .toLowerCase()

                        ===

                        searchType

                    )


            );


    }









    //--------------------------------
    // Ability search
    //--------------------------------


    getByAbility(
        ability
    )
    {


        const searchAbility =
            ability.toUpperCase();





        return this.getAllPokemon()

            .filter(

                pokemon =>


                    (

                        pokemon.ability1 &&

                        pokemon.ability1.name === searchAbility

                    )


                    ||

                    (

                        pokemon.ability2 &&

                        pokemon.ability2.name === searchAbility

                    )


            );


    }



}





module.exports =
    PokemonDatabaseService;