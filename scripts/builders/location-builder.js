/**
 * Pokémon Companion
 * Location Builder
 *
 * Builds final location database.
 *
 * Responsibilities:
 * - Merge location metadata.
 * - Add location gates.
 * - Add Pokémon encounters.
 * - Create Pokémon location index.
 *
 * Does NOT:
 * - Parse source files.
 * - Extract ROM data.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationBuilder {


    build(game) {


        const databasePath =
            path.join(
                __dirname,
                "../../database",
                "generated",
                game
            );


        const rawPath =
            path.join(
                __dirname,
                "../../database",
                "raw",
                game
            );



        const metadata =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        rawPath,
                        "location-metadata.json"
                    ),
                    "utf8"
                )
            );



        const gates =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        rawPath,
                        "location-gates.json"
                    ),
                    "utf8"
                )
            );



        const encounters =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        rawPath,
                        "pokemon-encounters.json"
                    ),
                    "utf8"
                )
            );



        const locations = {};

        const pokemonLocations = {};



        //--------------------------------
        // Create locations from metadata
        //--------------------------------

        for (const id of Object.keys(metadata)) {

            locations[id] = {

                ...metadata[id],

                gates:
                    gates[id] || {

                        soft: [],

                        hard: []

                    },

                encounters: []

            };

        }



        //--------------------------------
        // Add encounter data
        //--------------------------------

        for (const encounter of encounters) {


            const locationId =
                encounter.map;



            if (!locations[locationId]) {

                continue;

            }



            for (const mon of encounter.mons) {


                const pokemon =
                    resolvePokemonName(
                        mon.species
                    );



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

                        displayMethod:
                            getDisplayMethod(
                                encounter.method
                            ),

                        slots: []

                    };


                    locations[locationId]
                        .encounters
                        .push(locationPokemon);

                }



                const slot = {

                    encounterRate:
                        encounter.encounterRate,

                    minLevel:
                        mon.minLevel,

                    maxLevel:
                        mon.maxLevel

                };



                const duplicate =
                    locationPokemon
                    .slots
                    .some(
                        existing =>
                            existing.encounterRate === slot.encounterRate &&
                            existing.minLevel === slot.minLevel &&
                            existing.maxLevel === slot.maxLevel
                    );



                if (!duplicate) {

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

                        displayMethod:
                            getDisplayMethod(
                                encounter.method
                            ),

                        slots: []

                    };


                    pokemonLocations[pokemon]
                        .push(pokemonLocation);

                }



                const reverseDuplicate =
                    pokemonLocation
                    .slots
                    .some(
                        existing =>
                            existing.encounterRate === slot.encounterRate &&
                            existing.minLevel === slot.minLevel &&
                            existing.maxLevel === slot.maxLevel
                    );



                if (!reverseDuplicate) {

                    pokemonLocation
                        .slots
                        .push(slot);

                }

            }

        }



        //--------------------------------
        // Save databases
        //--------------------------------


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



function resolvePokemonName(species) {


    if (!species) {

        return null;

    }


    if (typeof species === "string") {

        return species.replace(
            "SPECIES_",
            ""
        );

    }


    if (species.name) {

        return species.name;

    }


    return null;

}



function getDisplayMethod(method) {


    switch(method) {


        case "land_mons":

            return "Grass";


        case "water_mons":

            return "Surf";


        case "fishing_mons":

            return "Fishing";


        case "rock_smash_mons":

            return "Rock Smash";


        default:

            return method;

    }

}



module.exports = LocationBuilder;