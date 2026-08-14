/**
 * Pokémon Companion
 * Location Domain Object
 *
 * Represents a location in a Pokémon game.
 */

"use strict";


class Location {


    constructor(
        id,
        encounters = []
    ) {


        this.id = id;

        this.encounters = encounters;

    }



    getEncounterCount() {

        return this.encounters.length;

    }


}


module.exports = Location;