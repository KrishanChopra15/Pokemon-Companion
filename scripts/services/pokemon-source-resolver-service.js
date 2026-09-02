/**
 * Pokémon Companion
 * Pokémon Source Resolver Service
 *
 * Resolves how a Pokémon can be obtained.
 *
 * Responsibilities:
 * - Find all acquisition methods.
 * - Resolve wild encounter sources.
 * - Resolve evolution sources.
 * - Resolve starter sources.
 * - Resolve trade sources.
 *
 * Does NOT:
 * - Check progression.
 * - Check location access.
 * - Recommend teams.
 * - Handle battles.
 */

"use strict";





class PokemonSourceResolverService {



    constructor(
        encounterDatabase = [],
        evolutionService = null
    )
    {


        this.encounters =
            Array.isArray(
                encounterDatabase
            )
                ? encounterDatabase
                : [];


        this.evolution =
            evolutionService;


    }









    //--------------------------------
    // Main resolver
    //--------------------------------


    resolve(
        species
    )
    {


        return {


            species,


            sources:

            [

                ...this.getWildSources(
                    species
                ),


                ...this.getEvolutionSources(
                    species
                ),


                ...this.getStarterSources(
                    species
                ),


                ...this.getTradeSources(
                    species
                )

            ]


        };


    }









    //--------------------------------
    // Wild encounters
    //--------------------------------


    getWildSources(
        species
    )
    {


        const normalizedSpecies =
            this.normalizeSpecies(
                species
            );


        const sources = [];


        for(
            const encounter of
                this.encounters
        )
        {


            if(
                !encounter
                ||
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


                const monSpecies =
                    this.normalizeSpecies(
                        this.getSpeciesValue(
                            mon?.species
                        )
                    );


                if(
                    monSpecies !==
                    normalizedSpecies
                )
                {

                    continue;

                }


                sources.push({

                    method:
                        encounter.method ||
                        "WILD",


                    displayMethod:
                        encounter.displayMethod ||
                        this.getDisplayMethod(
                            encounter.method
                        ),


                    location:
                        encounter.map ||
                        encounter.location ||
                        null,


                    baseLabel:
                        encounter.baseLabel ||
                        null,


                    encounterRate:
                        encounter.encounterRate ??
                        null,


                    slotIndex:
                        mon.slotIndex ??
                        null,


                    slotEncounterRate:
                        mon.slotEncounterRate ??
                        null,


                    rod:
                        this.getRodForSlot(
                            encounter,
                            mon.slotIndex
                        ),


                    minLevel:
                        mon.minLevel ??
                        null,


                    maxLevel:
                        mon.maxLevel ??
                        null

                });


            }


        }


        return sources;


    }









    //--------------------------------
    // Evolution sources
    //--------------------------------


    getEvolutionSources(
        species
    )
    {


        if(
            !this.evolution
        )
        {

            return [];

        }



        const evolution =

            this.evolution.getEvolutionSource(

                this.normalizeConstant(

                    species

                )

            );



        if(
            !evolution
        )
        {

            return [];

        }



        return [

            {

                method:
                    "EVOLUTION",


                from:
                    evolution.from,


                requirement:
                    evolution.requirement


            }

        ];


    }









    //--------------------------------
    // Starter sources
    //--------------------------------


    getStarterSources(
        species
    )
    {


        const starters =
        [

            "BULBASAUR",

            "CHARMANDER",

            "SQUIRTLE"

        ];



        if(
            starters.includes(
                this.normalizeSpecies(
                    species
                )
            )
        )
        {

            return [

                {

                    method:
                        "STARTER"

                }

            ];

        }



        return [];


    }









    //--------------------------------
    // Trade sources
    //--------------------------------


    getTradeSources(
        species
    )
    {


        /*
            Generic trade source.

            Later this can be expanded with:

            - NPC trades
            - Link trades
            - Imported Pokemon
            - Friend trades

        */


        return [

            {

                method:
                    "TRADE",


                available:
                    true

            }

        ];


    }









    //--------------------------------
    // Resolve species value
    //--------------------------------


    getSpeciesValue(
        species
    )
    {


        if(
            typeof species ===
                "object"
            &&
            species !== null
        )
        {

            return (

                species.name

                ||

                species.constant

                ||

                null

            );

        }



        return species || null;


    }









    //--------------------------------
    // Normalize species
    //--------------------------------


    normalizeSpecies(
        species
    )
    {


        if(
            !species
        )
        {

            return null;

        }



        return String(
            species
        )
            .replace(
                /^SPECIES_/,
                ""
            )
            .toUpperCase();


    }









    //--------------------------------
    // Get display method
    //--------------------------------


    getDisplayMethod(
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

            ||

            "Wild"

        );


    }









    //--------------------------------
    // Resolve fishing rod
    //--------------------------------


    getRodForSlot(
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
                Array.isArray(
                    slots
                )
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









    //--------------------------------
    // Normalize constant
    //--------------------------------


    normalizeConstant(
        species
    )
    {


        if(
            !species
        )
        {

            return null;

        }


        const value =
            String(
                species
            );


        if(
            value.startsWith(
                "SPECIES_"
            )
        )
        {

            return value;

        }



        return (

            "SPECIES_" +

            value.toUpperCase()

        );


    }









    //--------------------------------
    // Explain
    //--------------------------------


    explain(
        species
    )
    {


        const result =

            this.resolve(

                species

            );



        return {


            pokemon:
                species,


            methods:
                result.sources.length,


            sources:
                result.sources


        };


    }



}





module.exports =
    PokemonSourceResolverService;