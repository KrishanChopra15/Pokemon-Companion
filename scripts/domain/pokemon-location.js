/**
 * Pokémon Companion
 * Pokémon Location Domain Object
 *
 * Represents where a Pokémon can be found.
 *
 * Responsibilities:
 * - Store Pokémon species.
 * - Store available locations.
 * - Provide location lookup helpers.
 *
 * Does NOT:
 * - Read JSON.
 * - Parse ROM data.
 * - Resolve Pokémon species.
 */

"use strict";


class PokemonLocation {


    /**
     * Create Pokémon location data.
     *
     * @param {Object} data
     */
    constructor({

        pokemon = null,

        locations = []

    } = {}) {


        this.pokemon =
            pokemon;


        this.locations =
            locations;


    }





    /**
     * Add a location.
     *
     * @param {Object} location
     */
    addLocation(location) {


        if(!location){

            return;

        }


        this.locations.push(
            location
        );


    }





    /**
     * Get number of locations.
     *
     * @returns {number}
     */
    getLocationCount() {


        return (
            this.locations.length
        );


    }





    /**
     * Find a location.
     *
     * @param {string} locationId
     * @returns {Object|null}
     */
    findLocation(locationId) {


        return (

            this.locations.find(

                location =>
                    location.location === locationId

            )

            ||

            null

        );


    }





    /**
     * Check if Pokémon exists in location.
     *
     * @param {string} locationId
     * @returns {boolean}
     */
    hasLocation(locationId) {


        return (

            this.findLocation(
                locationId
            )

            !==

            null

        );


    }





    /**
     * Get all encounter methods.
     *
     * Example:
     * Grass
     * Surf
     * Fishing
     *
     * @returns {string[]}
     */
    getMethods() {


        return [

            ...new Set(

                this.locations.map(

                    location =>
                        location.displayMethod

                )

            )

        ];


    }





}


module.exports =
    PokemonLocation;