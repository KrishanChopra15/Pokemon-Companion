/**
 * Pokémon Companion
 * Pokémon Source Resolver Service
 *
 * Resolves how a Pokémon can be obtained.
 *
 * Responsibilities:
 * - Find all acquisition methods.
 * - Resolve wild encounter sources.
 * - Resolve evolution sources.
 * - Resolve starter sources.
 * - Resolve trade sources.
 *
 * Does NOT:
 * - Check progression.
 * - Check location access.
 * - Recommend teams.
 * - Handle battles.
 */

"use strict";





class PokemonSourceResolverService {



    constructor(
        encounterDatabase = [],
        evolutionService = null
    )
    {


        this.encounters =
            encounterDatabase;


        this.evolution =
            evolutionService;


    }









    //--------------------------------
    // Main resolver
    //--------------------------------


    resolve(
        species
    )
    {


        return {


            species,


            sources:

            [

                ...this.getWildSources(
                    species
                ),


                ...this.getEvolutionSources(
                    species
                ),


                ...this.getStarterSources(
                    species
                ),


                ...this.getTradeSources(
                    species
                )

            ]


        };


    }









    //--------------------------------
    // Wild encounters
    //--------------------------------


    getWildSources(
        species
    )
    {


        return this.encounters

            .filter(

                encounter =>

                    encounter.species === species

            )

            .map(

                encounter =>

                ({

                    method:
                        "WILD",


                    location:
                        encounter.location,


                    level:
                        encounter.level || null

                })

            );


    }









    //--------------------------------
    // Evolution sources
    //--------------------------------


    getEvolutionSources(
        species
    )
    {


        if(
            !this.evolution
        )
        {

            return [];

        }



        const evolution =

            this.evolution.getEvolutionSource(

                this.normalizeConstant(

                    species

                )

            );



        if(
            !evolution
        )
        {

            return [];

        }



        return [

            {

                method:
                    "EVOLUTION",


                from:
                    evolution.from,


                requirement:
                    evolution.requirement


            }

        ];


    }









    //--------------------------------
    // Starter sources
    //--------------------------------


    getStarterSources(
        species
    )
    {


        const starters =
        [

            "BULBASAUR",

            "CHARMANDER",

            "SQUIRTLE"

        ];



        if(
            starters.includes(
                species
            )
        )
        {

            return [

                {

                    method:
                        "STARTER"

                }

            ];

        }



        return [];


    }









    //--------------------------------
    // Trade sources
    //--------------------------------


    getTradeSources(
        species
    )
    {


        /*
            Generic trade source.

            Later this can be expanded with:

            - NPC trades
            - Link trades
            - Imported Pokemon
            - Friend trades

        */


        return [

            {

                method:
                    "TRADE",


                available:
                    true

            }

        ];


    }









    //--------------------------------
    // Normalize constant
    //--------------------------------


    normalizeConstant(
        species
    )
    {


        if(
            species.startsWith(
                "SPECIES_"
            )
        )
        {

            return species;

        }



        return (

            "SPECIES_" +

            species.toUpperCase()

        );


    }









    //--------------------------------
    // Explain
    //--------------------------------


    explain(
        species
    )
    {


        const result =

            this.resolve(

                species

            );



        return {


            pokemon:
                species,


            methods:
                result.sources.length,


            sources:
                result.sources


        };


    }



}





module.exports =
    PokemonSourceResolverService;