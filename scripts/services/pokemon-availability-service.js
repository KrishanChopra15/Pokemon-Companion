/**
 * Pokémon Companion
 * Pokémon Availability Service v4
 *
 * Determines Pokémon availability during progression.
 *
 * Responsibilities:
 * - Check Pokémon availability.
 * - Check encounters.
 * - Check evolution difficulty.
 * - Respect official progression locks.
 * - Read Pokémon restriction rules.
 * - Support trade overrides.
 *
 * Does NOT:
 * - Handle battles.
 * - Recommend teams.
 * - Load ROM data.
 */

"use strict";





class PokemonAvailabilityService {



    constructor(
        pokemonDatabase,
        locationDatabase = null,
        evolutionService = null,
        availabilityDatabase = null,
        progressionRules = null,
        pokemonRestrictions = null
    )
    {


        this.pokemonDatabase =
            pokemonDatabase;


        this.locationDatabase =
            locationDatabase;


        this.evolution =
            evolutionService;


        this.availabilityDatabase =
            availabilityDatabase;


        this.rules =
            progressionRules || {};



        this.restrictions =
            pokemonRestrictions || {};


    }









    //--------------------------------
    // Main availability check
    //--------------------------------


    isAvailable(
        species,
        context = {}
    )
    {


        const pokemon =
            this.getPokemon(
                species
            );



        if(
            !pokemon
        )
        {

            return {

                available:false,

                status:"ERROR",

                reason:
                    "Pokemon not found"

            };

        }








        //--------------------------------
        // Trade override
        //--------------------------------


        if(
            context.source === "TRADE"
        )
        {

            return this.checkTrade(

                species,

                context

            );

        }








        //--------------------------------
        // Official restrictions
        //--------------------------------


        const restriction =
            this.checkOfficialRestriction(

                species,

                context

            );



        if(
            !restriction.available
        )
        {

            return restriction;

        }








        //--------------------------------
        // Location check
        //--------------------------------


        if(
            context.location
        )
        {


            const location =
                this.isAvailableAtLocation(

                    species,

                    context.location

                );



            if(
                !location.available
            )
            {

                return location;

            }

        }








        //--------------------------------
        // Difficulty calculation
        //--------------------------------


        const difficulty =
            this.calculateDifficulty(

                species,

                context

            );








        return {


            available:true,


            status:"AVAILABLE",


            species:pokemon.name,


            constant:pokemon.constant,


            difficulty:

                difficulty.level,


            warning:

                difficulty.warning,


            source:"NORMAL"


        };


    }









    //--------------------------------
    // Get Pokemon
    //--------------------------------


    getPokemon(
        species
    )
    {


        return this.pokemonDatabase

            ?

            this.pokemonDatabase.getPokemon(

                species

            )

            :

            null;


    }









    //--------------------------------
    // Official restriction rules
    //--------------------------------


    checkOfficialRestriction(
        species,
        context
    )
    {


        const rule =
            this.restrictions[species];



        if(
            !rule
        )
        {

            return {

                available:true

            };

        }








        //--------------------------------
        // Post game unlock
        //--------------------------------


        if(
            rule.availableAfter
            &&
            context.progression !==
            rule.availableAfter
        )
        {

            return {


                available:false,


                status:"LOCKED",


                difficulty:"LOCKED",


                reason:

                    rule.reason


            };

        }








        //--------------------------------
        // Requirement based unlock
        //--------------------------------


        if(
            rule.requirements
        )
        {


            const missing =
                this.getMissingRequirements(

                    rule.requirements,

                    context

                );



            if(
                missing.length > 0
            )
            {

                return {


                    available:false,


                    status:"LOCKED",


                    difficulty:"LOCKED",


                    reason:

                        rule.reason,


                    missingRequirements:

                        missing


                };

            }


        }








        return {

            available:true

        };


    }









    //--------------------------------
    // Check missing requirements
    //--------------------------------


    getMissingRequirements(
        requirements,
        context
    )
    {


        const missing = [];



        requirements.forEach(

            requirement =>

            {


                if(
                    requirement ===
                    "CHAMPION_DEFEATED"
                    &&
                    context.progression !==
                    "POST_GAME"
                )
                {

                    missing.push(

                        requirement

                    );

                }



                if(
                    requirement ===
                    "NATIONAL_DEX"
                    &&
                    !context.nationalDex
                )
                {

                    missing.push(

                        requirement

                    );

                }



            }

        );



        return missing;


    }









    //--------------------------------
    // Normalize constant
    //--------------------------------


    normalizeSpeciesConstant(
        species
    )
    {


        if(
            species.startsWith(
                "SPECIES_"
            )
        )
        {

            return species;

        }



        return (

            "SPECIES_" +

            species.toUpperCase()

        );


    }









    //--------------------------------
    // Evolution difficulty
    //--------------------------------


    calculateDifficulty(
        species,
        context
    )
    {


        if(
            !this.evolution
            ||
            !context.progression
        )
        {

            return {

                level:"NORMAL",

                warning:null

            };

        }








        const evolution =
            this.evolution.getEvolutionSource(

                this.normalizeSpeciesConstant(

                    species

                )

            );



        if(
            !evolution
        )
        {

            return {

                level:"NORMAL",

                warning:null

            };

        }








        const requirement =
            evolution.requirement;



        if(
            requirement.method !==
            "LEVEL"
        )
        {

            return {

                level:"NORMAL",

                warning:null

            };

        }








        const rule =
            this.rules[

                context.progression

            ];



        if(
            !rule
        )
        {

            return {

                level:"NORMAL",

                warning:null

            };

        }








        if(
            requirement.level <=
            rule.recommendedLevel
        )
        {

            return {

                level:"NORMAL",

                warning:null

            };

        }








        if(
            requirement.level <=
            rule.maxReasonableLevel
        )
        {

            return {


                level:"HARD_GRIND",


                warning:

                `Possible before ${context.progression}. Requires evolution at level ${requirement.level}.`


            };

        }








        return {


            level:"EXTREME_GRIND",


            warning:

            `Possible before ${context.progression}, but requires excessive grinding to reach level ${requirement.level}.`


        };


    }









    //--------------------------------
    // Location availability
    //--------------------------------


    isAvailableAtLocation(
        species,
        location
    )
    {


        if(
            !this.locationDatabase
        )
        {

            return {

                available:true

            };

        }



        const encounters =
            this.locationDatabase.getPokemon(

                location

            );



        if(
            !encounters
        )
        {

            return {

                available:false,

                status:"LOCKED",

                reason:
                    "Location has no encounters"

            };

        }



        const found =
            encounters.some(

                pokemon =>

                    pokemon.species === species

            );



        return {


            available:found,


            status:

                found

                ?

                "AVAILABLE"

                :

                "LOCKED"


        };


    }









    //--------------------------------
    // Trade override
    //--------------------------------


    checkTrade(
        species
    )
    {


        const pokemon =
            this.getPokemon(

                species

            );



        if(
            !pokemon
        )
        {

            return {

                available:false,

                status:"ERROR",

                reason:
                    "Pokemon not found"

            };

        }



        return {


            available:true,


            status:"AVAILABLE",


            species:pokemon.name,


            constant:pokemon.constant,


            difficulty:"TRADE",


            warning:

            "Obtained through trade. Not available through normal FireRed progression.",


            source:"TRADE"


        };


    }









    //--------------------------------
    // Filter
    //--------------------------------


    filterAvailable(
        pokemonList,
        context={}
    )
    {


        return pokemonList.map(

            species =>

            ({

                species,


                result:

                    this.isAvailable(

                        species,

                        context

                    )


            })

        );


    }









    //--------------------------------
    // Explain
    //--------------------------------


    explain(
        species,
        context={}
    )
    {


        return this.isAvailable(

            species,

            context

        );


    }



}





module.exports =
    PokemonAvailabilityService;