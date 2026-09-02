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
 * - Provide encounter method helpers.
 * - Provide fishing rod helpers.
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
            Array.isArray(locations)
                ? locations
                : [];


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

                this.locations
                    .map(

                        location =>
                            location.displayMethod

                    )
                    .filter(Boolean)

            )

        ];


    }





    /**
     * Get locations using a specific encounter method.
     *
     * @param {string} method
     * @returns {Object[]}
     */
    getLocationsByMethod(method) {


        if(!method){

            return [];

        }


        return this.locations.filter(

            location =>
                location.method === method

        );


    }





    /**
     * Get fishing locations.
     *
     * @returns {Object[]}
     */
    getFishingLocations() {


        return this.getLocationsByMethod(
            "fishing_mons"
        );


    }





    /**
     * Get rods available at a location.
     *
     * @param {string} locationId
     * @returns {string[]}
     */
    getRods(locationId) {


        const location =
            this.findLocation(
                locationId
            );


        if(
            !location
            ||
            !location.rodGroups
        ) {

            return [];

        }


        return Object.keys(
            location.rodGroups
        );


    }





    /**
     * Get encounter slots for a location.
     *
     * @param {string} locationId
     * @returns {Object[]}
     */
    getSlots(locationId) {


        const location =
            this.findLocation(
                locationId
            );


        if(
            !location
            ||
            !Array.isArray(
                location.slots
            )
        ) {

            return [];

        }


        return location.slots;


    }





}


module.exports =
    PokemonLocation;