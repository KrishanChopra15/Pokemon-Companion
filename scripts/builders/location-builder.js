/**
 * Pokémon Companion
 * Location Builder
 *
 * Builds location databases.
 *
 * Responsibilities:
 * - Convert encounter data into locations.
 * - Group Pokémon encounters.
 * - Remove duplicate encounter slots.
 * - Add readable encounter methods.
 * - Create Pokémon location index.
 *
 * Does NOT:
 * - Parse source files.
 * - Extract ROM data.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const LocationMethods =
    require("../shared/location/location-methods");


class LocationBuilder {


    build(game) {


        const databasePath =
            path.join(
                __dirname,
                "../../database/generated",
                game
            );


        const encounterPath =
            path.join(
                databasePath,
                "pokemon-encounters.json"
            );


        const encounters =
            JSON.parse(
                fs.readFileSync(
                    encounterPath,
                    "utf8"
                )
            );



        const locations = {};

        const pokemonLocations = {};



        for (const encounter of encounters) {


            const locationId =
                encounter.map;



            if (!locations[locationId]) {

                locations[locationId] = {

                    id: locationId,

                    encounters: []

                };

            }



            for (const mon of encounter.mons) {


                const pokemon =
                    mon.species.name;



                const slot = {

                    encounterRate:
                        encounter.encounterRate,

                    minLevel:
                        mon.minLevel,

                    maxLevel:
                        mon.maxLevel

                };



                const displayMethod =
                    LocationMethods[encounter.method]
                        ? LocationMethods[encounter.method].name
                        : encounter.method;



                //--------------------------------
                // Location database
                //--------------------------------


                let locationPokemon =
                    locations[locationId]
                    .encounters
                    .find(
                        entry =>
                            entry.pokemon === pokemon &&
                            entry.method === encounter.method
                    );



                if (!locationPokemon) {

                    locationPokemon = {

                        pokemon,

                        method:
                            encounter.method,

                        displayMethod,

                        slots: []

                    };


                    locations[locationId]
                        .encounters
                        .push(locationPokemon);

                }



                const existingLocationSlot =
                    locationPokemon
                    .slots
                    .find(
                        existing =>
                            existing.encounterRate === slot.encounterRate &&
                            existing.minLevel === slot.minLevel &&
                            existing.maxLevel === slot.maxLevel
                    );



                if (!existingLocationSlot) {

                    locationPokemon
                        .slots
                        .push(slot);

                }



                //--------------------------------
                // Pokémon reverse index
                //--------------------------------


                if (!pokemonLocations[pokemon]) {

                    pokemonLocations[pokemon] = [];

                }



                let pokemonLocation =
                    pokemonLocations[pokemon]
                    .find(
                        entry =>
                            entry.location === locationId &&
                            entry.method === encounter.method
                    );



                if (!pokemonLocation) {

                    pokemonLocation = {

                        location:
                            locationId,

                        method:
                            encounter.method,

                        displayMethod,

                        slots: []

                    };


                    pokemonLocations[pokemon]
                        .push(pokemonLocation);

                }



                const existingPokemonSlot =
                    pokemonLocation
                    .slots
                    .find(
                        existing =>
                            existing.encounterRate === slot.encounterRate &&
                            existing.minLevel === slot.minLevel &&
                            existing.maxLevel === slot.maxLevel
                    );



                if (!existingPokemonSlot) {

                    pokemonLocation
                        .slots
                        .push(slot);

                }

            }

        }



        fs.writeFileSync(
            path.join(
                databasePath,
                "locations.json"
            ),
            JSON.stringify(
                locations,
                null,
                2
            )
        );



        fs.writeFileSync(
            path.join(
                databasePath,
                "pokemon-locations.json"
            ),
            JSON.stringify(
                pokemonLocations,
                null,
                2
            )
        );



        console.log(
            `Generated ${Object.keys(locations).length} locations`
        );


        console.log(
            `Generated ${Object.keys(pokemonLocations).length} Pokémon location records`
        );

    }


}


module.exports = LocationBuilder;