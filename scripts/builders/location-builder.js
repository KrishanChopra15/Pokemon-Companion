/**
 * Pokémon Companion
 * Location Builder
 *
 * Builds final location database.
 *
 * Responsibilities:
 * - Merge location metadata.
 * - Add location gates.
 * - Add location graph connections.
 * - Add Pokémon encounters.
 * - Preserve encounter slot information.
 * - Preserve fishing rod information.
 * - Create Pokémon location index.
 *
 * Does NOT:
 * - Parse source files.
 * - Extract ROM data.
 * - Determine gym progression.
 * - Calculate player state.
 * - Execute progression.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class LocationBuilder
{


    build(
        game
    )
    {


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
                recursive:
                    true
            }

        );


        //--------------------------------
        // Load location metadata
        //--------------------------------

        const metadata =
            this.load(

                rawPath,

                "location-metadata.json",

                {}

            );


        //--------------------------------
        // Load location gates
        //--------------------------------

        const gates =
            this.load(

                rawPath,

                "location-gates.json",

                {}

            );


        //--------------------------------
        // Load location graph
        //--------------------------------

        const graph =
            this.load(

                rawPath,

                "location-graph.json",

                {}

            );


        //--------------------------------
        // Load encounters
        //--------------------------------

        const encounters =
            this.load(

                rawPath,

                "pokemon-encounters.json",

                []

            );


        const locations = {};


        const pokemonLocations = {};





        //================================
        // Create locations
        //================================

        for(
            const id of
                Object.keys(
                    metadata
                )
        )
        {


            const locationGraph =
                graph[id]
                ||
                [];


            const locationGates =
                gates[id]
                ||
                {

                    soft:
                        [],

                    hard:
                        []

                };


            locations[id] =
            {

                ...metadata[id],


                gates:
                    this.normalizeGates(
                        locationGates
                    ),


                connections:
                    this.normalizeConnections(
                        locationGraph
                    ),


                encounters:
                    []

            };

        }





        //================================
        // Add encounters
        //================================

        for(
            const encounter of
                encounters
        )
        {


            if(
                !encounter
            )
            {

                continue;

            }


            const locationId =
                encounter.map;


            if(
                !locations[locationId]
            )
            {

                continue;

            }


            if(
                !Array.isArray(
                    encounter.mons
                )
            )
            {

                continue;

            }


            for(
                const mon of
                    encounter.mons
            )
            {


                const pokemon =
                    resolvePokemonName(
                        mon?.species
                    );


                if(
                    !pokemon
                )
                {

                    continue;

                }


                //--------------------------------
                // Add encounter to location
                //--------------------------------

                this.addLocationEncounter(

                    locations[locationId],

                    pokemon,

                    encounter,

                    mon

                );


                //--------------------------------
                // Add location to Pokémon index
                //--------------------------------

                this.addPokemonLocation(

                    pokemonLocations,

                    pokemon,

                    locationId,

                    encounter,

                    mon

                );

            }

        }





        //================================
        // Save location database
        //================================

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





        //================================
        // Save Pokémon location index
        //================================

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





        //================================
        // Build report
        //================================

        console.log(

            `Generated ${Object.keys(locations).length} locations`

        );


        console.log(

            `Generated ${Object.keys(pokemonLocations).length} Pokémon location records`

        );

    }





    //--------------------------------
    // Load JSON database
    //--------------------------------

    load(
        folder,
        file,
        defaultValue = null
    )
    {


        const location =
            path.join(

                folder,

                file

            );


        if(
            !fs.existsSync(
                location
            )
        )
        {

            return defaultValue;

        }


        return JSON.parse(

            fs.readFileSync(

                location,

                "utf8"

            )

        );

    }





    //--------------------------------
    // Normalize gates
    //--------------------------------

    normalizeGates(
        gates
    )
    {


        if(
            !gates
            ||
            typeof gates !==
                "object"
        )
        {

            return {

                soft:
                    [],

                hard:
                    []

            };

        }


        return {

            soft:
                Array.isArray(
                    gates.soft
                )
                ?
                gates.soft
                :
                [],


            hard:
                Array.isArray(
                    gates.hard
                )
                ?
                gates.hard
                :
                []

        };

    }





    //--------------------------------
    // Normalize graph connections
    //--------------------------------

    normalizeConnections(
        connections
    )
    {


        if(
            !Array.isArray(
                connections
            )
        )
        {

            return [];

        }


        const result = [];


        const seen =
            new Set();


        for(
            const connection of
                connections
        )
        {


            if(
                !connection
            )
            {

                continue;

            }


            //--------------------------------
            // Existing graph format
            //--------------------------------

            const location =
                typeof connection ===
                    "string"
                ?
                connection
                :
                connection.location;


            if(
                !location
            )
            {

                continue;

            }


            if(
                seen.has(
                    location
                )
            )
            {

                continue;

            }


            seen.add(
                location
            );


            result.push({

                location,

                requirements:
                    Array.isArray(
                        connection.requirements
                    )
                    ?
                    connection.requirements
                    :
                    []

            });

        }


        return result;

    }





    //--------------------------------
    // Add location encounter
    //--------------------------------

    addLocationEncounter(
        location,
        pokemon,
        encounter,
        mon
    )
    {


        let entry =
            location.encounters.find(

                e =>

                    e.pokemon ===
                        pokemon

                    &&

                    e.method ===
                        encounter.method

            );


        if(
            !entry
        )
        {


            entry =
            {

                pokemon,

                method:
                    encounter.method,

                displayMethod:
                    getDisplayMethod(
                        encounter.method
                    ),

                encounterRate:
                    encounter.encounterRate,

                rodGroups:
                    encounter.method ===
                        "fishing_mons"
                    &&
                    encounter.rodGroups
                        ?
                        {
                            ...encounter.rodGroups
                        }
                        :
                        null,

                slots:
                    []

            };


            location.encounters.push(
                entry
            );

        }


        addSlot(

            entry.slots,

            encounter,

            mon

        );

    }





    //--------------------------------
    // Add Pokémon location
    //--------------------------------

    addPokemonLocation(
        index,
        pokemon,
        locationId,
        encounter,
        mon
    )
    {


        if(
            !index[pokemon]
        )
        {

            index[pokemon] =
                [];

        }


        let entry =
            index[pokemon].find(

                e =>

                    e.location ===
                        locationId

                    &&

                    e.method ===
                        encounter.method

            );


        if(
            !entry
        )
        {


            entry =
            {

                location:
                    locationId,

                method:
                    encounter.method,

                displayMethod:
                    getDisplayMethod(
                        encounter.method
                    ),

                encounterRate:
                    encounter.encounterRate,

                rodGroups:
                    encounter.method ===
                        "fishing_mons"
                    &&
                    encounter.rodGroups
                        ?
                        {
                            ...encounter.rodGroups
                        }
                        :
                        null,

                slots:
                    []

            };


            index[pokemon].push(
                entry
            );

        }


        addSlot(

            entry.slots,

            encounter,

            mon

        );

    }

}





//========================================
// Add encounter slot
//========================================

function addSlot(
    slots,
    encounter,
    mon
)
{


    const rod =
        getFishingRodForSlot(
            encounter,
            mon?.slotIndex
        );


    const slot =
    {

        slotIndex:
            mon?.slotIndex ?? null,

        encounterRate:
            encounter.encounterRate,

        slotEncounterRate:
            mon?.slotEncounterRate ?? null,

        rod,

        minLevel:
            mon.minLevel,

        maxLevel:
            mon.maxLevel

    };


    const exists =
        slots.some(

            existing =>

                existing.slotIndex ===
                    slot.slotIndex

                &&

                existing.encounterRate ===
                    slot.encounterRate

                &&

                existing.slotEncounterRate ===
                    slot.slotEncounterRate

                &&

                existing.rod ===
                    slot.rod

                &&

                existing.minLevel ===
                    slot.minLevel

                &&

                existing.maxLevel ===
                    slot.maxLevel

        );


    if(
        !exists
    )
    {

        slots.push(
            slot
        );

    }

}





//========================================
// Resolve fishing rod
//========================================

function getFishingRodForSlot(
    encounter,
    slotIndex
)
{


    if(
        encounter?.method !==
            "fishing_mons"
    )
    {

        return null;

    }


    if(
        !encounter.rodGroups
        ||
        slotIndex === null
        ||
        slotIndex === undefined
    )
    {

        return null;

    }


    for(
        const [rod, slots] of
            Object.entries(
                encounter.rodGroups
            )
    )
    {


        if(
            Array.isArray(slots)
            &&
            slots.includes(
                slotIndex
            )
        )
        {

            return rod;

        }

    }


    return null;

}





//========================================
// Resolve Pokémon name
//========================================

function resolvePokemonName(
    species
)
{


    if(
        !species
    )
    {

        return null;

    }


    //--------------------------------
    // Generated database format
    //--------------------------------

    if(
        typeof species ===
            "object"
    )
    {


        return (

            species.name

            ||

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

    if(
        typeof species ===
            "string"
    )
    {

        return species.replace(

            "SPECIES_",

            ""

        );

    }


    return null;

}





//========================================
// Display encounter method
//========================================

function getDisplayMethod(
    method
)
{


    const methods =
    {

        land_mons:
            "Grass",

        water_mons:
            "Surf",

        fishing_mons:
            "Fishing",

        rock_smash_mons:
            "Rock Smash"

    };


    return (

        methods[method]

        ||

        method

    );

}





module.exports =
    LocationBuilder;