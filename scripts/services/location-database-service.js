/**
 * Pokémon Companion
 * Location Database Service
 *
 * Provides access to generated location databases.
 *
 * Responsibilities:
 * - Load location database.
 * - Query locations.
 * - Query Pokémon locations.
 * - Query Pokémon available in a location.
 *
 * Does NOT:
 * - Build databases.
 * - Parse source files.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationDatabaseService {


    constructor(game) {


        const databasePath =
            path.join(
                __dirname,
                "../../database/generated",
                game
            );



        this.locations =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        databasePath,
                        "locations.json"
                    ),
                    "utf8"
                )
            );



        this.pokemonLocations =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        databasePath,
                        "pokemon-locations.json"
                    ),
                    "utf8"
                )
            );


    }



    getLocation(id) {

        return this.locations[id] || null;

    }



    getAllLocations() {

        return Object.values(
            this.locations
        );

    }



    getPokemonInLocation(id) {


        const location =
            this.getLocation(id);



        if (!location) {

            return [];

        }



        return [
            ...new Set(
                location.encounters.map(
                    encounter =>
                        encounter.pokemon
                )
            )
        ];

    }



    getPokemonLocations(pokemon) {

        return this.pokemonLocations[pokemon] || [];

    }



    getPokemonCount() {

        return Object.keys(
            this.pokemonLocations
        ).length;

    }


}


module.exports = LocationDatabaseService;