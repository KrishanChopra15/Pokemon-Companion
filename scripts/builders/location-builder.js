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
                "../../database/generated",
                game
            );


        const rawPath =
            path.join(
                __dirname,
                "../../database/raw",
                game
            );



        fs.mkdirSync(
            databasePath,
            {
                recursive:true
            }
        );



        const metadata =
            this.load(
                rawPath,
                "location-metadata.json"
            );


        const gates =
            this.load(
                rawPath,
                "location-gates.json",
                {}
            );


        const encounters =
            this.load(
                rawPath,
                "pokemon-encounters.json",
                []
            );



        const locations = {};

        const pokemonLocations = {};




        //--------------------------------
        // Create locations
        //--------------------------------


        for (const id of Object.keys(metadata)) {


            locations[id] = {


                ...metadata[id],


                gates:
                    gates[id] ||
                    {
                        soft:[],
                        hard:[]
                    },


                encounters:[]


            };


        }





        //--------------------------------
        // Add encounters
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



                if (!pokemon) {

                    continue;

                }



                this.addLocationEncounter(
                    locations[locationId],
                    pokemon,
                    encounter,
                    mon
                );



                this.addPokemonLocation(
                    pokemonLocations,
                    pokemon,
                    locationId,
                    encounter,
                    mon
                );


            }


        }





        //--------------------------------
        // Save
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





    load(folder,file,defaultValue=null){


        const location =
            path.join(
                folder,
                file
            );


        if(!fs.existsSync(location)){

            return defaultValue;

        }


        return JSON.parse(
            fs.readFileSync(
                location,
                "utf8"
            )
        );


    }






    addLocationEncounter(
        location,
        pokemon,
        encounter,
        mon
    ){


        let entry =
            location.encounters.find(
                e =>
                    e.pokemon === pokemon &&
                    e.method === encounter.method
            );



        if(!entry){


            entry = {


                pokemon,


                method:
                    encounter.method,


                displayMethod:
                    getDisplayMethod(
                        encounter.method
                    ),


                slots:[]


            };


            location.encounters.push(entry);


        }



        addSlot(
            entry.slots,
            encounter,
            mon
        );


    }







    addPokemonLocation(
        index,
        pokemon,
        locationId,
        encounter,
        mon
    ){


        if(!index[pokemon]){

            index[pokemon] = [];

        }



        let entry =
            index[pokemon].find(
                e =>
                    e.location === locationId &&
                    e.method === encounter.method
            );



        if(!entry){


            entry = {


                location:
                    locationId,


                method:
                    encounter.method,


                displayMethod:
                    getDisplayMethod(
                        encounter.method
                    ),


                slots:[]


            };


            index[pokemon].push(entry);


        }



        addSlot(
            entry.slots,
            encounter,
            mon
        );


    }


}




function addSlot(
    slots,
    encounter,
    mon
){


    const slot = {


        encounterRate:
            encounter.encounterRate,


        minLevel:
            mon.minLevel,


        maxLevel:
            mon.maxLevel


    };



    const exists =
        slots.some(
            s =>
                s.encounterRate === slot.encounterRate &&
                s.minLevel === slot.minLevel &&
                s.maxLevel === slot.maxLevel
        );



    if(!exists){

        slots.push(slot);

    }


}






function resolvePokemonName(species){


    if(!species){

        return null;

    }



    //--------------------------------
    // Generated database format
    //--------------------------------

    if(typeof species === "object") {


        return (

            species.name ||

            species.constant
                ?.replace(
                    "SPECIES_",
                    ""
                )

            ||

            null

        );


    }



    //--------------------------------
    // Raw database format
    //--------------------------------

    if(typeof species === "string"){


        return species.replace(
            "SPECIES_",
            ""
        );


    }



    return null;


}






function getDisplayMethod(method){


    const methods = {


        land_mons:
            "Grass",


        water_mons:
            "Surf",


        fishing_mons:
            "Fishing",


        rock_smash_mons:
            "Rock Smash"


    };


    return methods[method] || method;


}





module.exports =
    LocationBuilder;