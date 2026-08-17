/**
 * Pokémon Companion
 * Evolution Service
 *
 * Handles Pokémon evolution logic.
 *
 * Responsibilities:
 * - Check evolution requirements.
 * - Process level evolutions.
 * - Process item evolutions.
 * - Process trade evolutions.
 * - Lookup evolution data.
 * - Return evolution results.
 *
 * Does NOT:
 * - Give EXP.
 * - Handle battles.
 * - Calculate stats.
 * - Manage storage.
 * - Load ROM data.
 */

"use strict";





class EvolutionService {



    constructor(
        evolutionDatabase = null
    )
    {

        this.database =
            evolutionDatabase;


    }









    //--------------------------------
    // Automatic evolution check
    //--------------------------------


    checkEvolution(
        pokemon,
        context = {}
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }








        const evolution =
            this.getEvolutionData(

                pokemon

            );








        if(
            !evolution
        )
        {

            return {

                success:false,

                reason:
                    "No evolution available"

            };

        }








        return this.evolve(

            pokemon,

            {

                method:

                    evolution.method,


                value:

                    evolution.value,


                target:

                    evolution.target,


                context

            }

        );


    }









    //--------------------------------
    // Evolution database lookup
    //--------------------------------


    getEvolutionData(
        pokemon
    )
    {


        if(
            !pokemon
            ||
            !this.database
        )
        {

            return null;

        }








        return this.getEvolution(

            pokemon.species

        );


    }









    //--------------------------------
    // Check evolution requirements
    //--------------------------------


    canEvolve(
        pokemon,
        method,
        value,
        context = {}
    )
    {


        if(
            !pokemon
        )
        {

            return {

                allowed:false,

                reason:
                    "Missing Pokemon"

            };

        }








        switch(
            method
        )
        {


            case "LEVEL":

                return {

                    allowed:

                        pokemon.level >= value,


                    reason:

                        pokemon.level >= value

                        ?

                        null

                        :

                        "Level requirement not met"

                };





            case "ITEM":

                return {

                    allowed:

                        context.items

                        &&

                        context.items.includes(value),



                    reason:

                        context.items

                        &&

                        context.items.includes(value)

                        ?

                        null

                        :

                        "Missing evolution item"

                };





            case "TRADE":

                return {

                    allowed:

                        context.traded === true,


                    reason:

                        context.traded

                        ?

                        null

                        :

                        "Trade required"

                };





            default:

                return {

                    allowed:false,

                    reason:
                        "Unknown evolution method"

                };


        }


    }









    //--------------------------------
    // Evolve Pokemon
    //--------------------------------


    evolve(
        pokemon,
        evolution
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }








        if(
            !evolution
        )
        {

            return {

                success:false,

                reason:
                    "Missing evolution data"

            };

        }








        const check =
            this.canEvolve(

                pokemon,

                evolution.method,

                evolution.value,

                evolution.context || {}

            );








        if(
            !check.allowed
        )
        {

            return {

                success:false,

                reason:
                    check.reason

            };

        }








        const oldSpecies =
            pokemon.species;








        pokemon.species =
            evolution.target;








        return {


            success:true,


            from:

                oldSpecies,


            to:

                pokemon.species,


            method:

                evolution.method


        };


    }









    //--------------------------------
    // Level evolution
    //--------------------------------


    evolveByLevel(
        pokemon,
        target,
        level
    )
    {


        return this.evolve(

            pokemon,

            {

                method:
                    "LEVEL",


                value:
                    level,


                target

            }

        );


    }









    //--------------------------------
    // Item evolution
    //--------------------------------


    evolveByItem(
        pokemon,
        target,
        item,
        items
    )
    {


        return this.evolve(

            pokemon,

            {

                method:
                    "ITEM",


                value:
                    item,


                target,


                context:
                {

                    items

                }

            }

        );


    }









    //--------------------------------
    // Trade evolution
    //--------------------------------


    evolveByTrade(
        pokemon,
        target,
        traded = false
    )
    {


        return this.evolve(

            pokemon,

            {

                method:
                    "TRADE",


                value:
                    null,


                target,


                context:
                {

                    traded

                }

            }

        );


    }









    //--------------------------------
    // Database lookup
    //--------------------------------


    getEvolution(
        species
    )
    {


        if(
            !this.database
        )
        {

            return null;

        }








        let name =
            species.toUpperCase();








        if(
            name.startsWith(
                "SPECIES_"
            )
        )
        {

            name =
                name.replace(
                    "SPECIES_",
                    ""
                );

        }








        return this.database.getEvolution(

            name

        );


    }



}





module.exports =
    EvolutionService;