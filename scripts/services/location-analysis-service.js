/**
 * Pokémon Companion
 * Location Analysis Service
 *
 * Provides location-based Pokémon analysis.
 *
 * Responsibilities:
 * - Analyze Pokémon availability across locations.
 * - Combine encounter data.
 * - Compare Pokémon availability.
 *
 * Does NOT:
 * - Build databases.
 * - Parse source files.
 * - Handle trainer progression.
 * - Calculate reachable locations.
 */

"use strict";


class LocationAnalysisService {


    constructor(
        locationDatabaseService
    ) {


        this.locationDatabase =
            locationDatabaseService;


    }



    /**
     * Returns unique Pokémon available
     * across multiple locations.
     */
    getPokemonAvailableInLocations(
        locations
    ) {


        const pokemon =
            new Set();



        for (const location of locations) {


            const available =
                this.locationDatabase
                    .getPokemonInLocation(
                        location
                    );



            for (const species of available) {


                pokemon.add(
                    species
                );


            }


        }



        return [
            ...pokemon
        ];

    }




    /**
     * Returns locations where
     * a Pokémon can be found.
     */
    getLocationsContainingPokemon(
        pokemon
    ) {


        return this.locationDatabase
            .getPokemonLocations(
                pokemon
            );


    }





    /**
     * Counts unique Pokémon
     * available in locations.
     */
    getPokemonCountInLocations(
        locations
    ) {


        return this
            .getPokemonAvailableInLocations(
                locations
            )
            .length;


    }





    /**
     * Returns Pokémon that exist
     * in both location groups.
     *
     * Example:
     * Before Brock vs After Brock
     */
    getCommonPokemon(
        firstLocations,
        secondLocations
    ) {


        const first =
            new Set(
                this.getPokemonAvailableInLocations(
                    firstLocations
                )
            );



        const second =
            this.getPokemonAvailableInLocations(
                secondLocations
            );



        return second.filter(
            pokemon =>
                first.has(
                    pokemon
                )
        );


    }





    /**
     * Returns Pokémon found only
     * in the second group.
     */
    getNewPokemon(
        previousLocations,
        newLocations
    ) {


        const previous =
            new Set(
                this.getPokemonAvailableInLocations(
                    previousLocations
                )
            );



        const current =
            this.getPokemonAvailableInLocations(
                newLocations
            );



        return current.filter(
            pokemon =>
                !previous.has(
                    pokemon
                )
        );


    }



}


module.exports = LocationAnalysisService;