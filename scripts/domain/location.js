/**
 * Pokémon Companion
 * Location Domain Object
 *
 * Represents a location in a Pokémon game.
 */

"use strict";


class Location {


    constructor({

        id,

        name = null,

        region = null,

        map = null,

        connections = [],

        gates = {
            soft: [],
            hard: []
        },

        encounters = []

    } = {}) {


        this.id =
            id;


        this.name =
            name;


        this.region =
            region;


        this.map =
            map;



        this.connections =
            connections;



        this.gates =
            gates;



        this.encounters =
            encounters;


    }





    addEncounter(encounter) {


        this.encounters.push(
            encounter
        );


    }





    hasEncounters() {


        return (
            this.encounters.length > 0
        );


    }





    getEncounterCount() {


        return (
            this.encounters.length
        );


    }





    hasGate() {


        return (

            this.gates.soft.length > 0

            ||

            this.gates.hard.length > 0

        );


    }


}


module.exports = Location;