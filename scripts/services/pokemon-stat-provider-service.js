/**
 * Pokémon Companion
 * Pokémon Stat Provider Service
 *
 * Resolves battle stats source.
 *
 * Responsibilities:
 * - Use user provided IV/EV/nature.
 * - Generate simulation stats when missing.
 * - Provide exact/random/best/worst cases.
 * - Prepare data for StatCalculationService.
 *
 * Does NOT:
 * - Calculate final stats.
 * - Execute battles.
 */

"use strict";





class PokemonStatProviderService {



    constructor(
        statCalculationService = null
    )
    {


        this.statCalculation =
            statCalculationService;


    }









    //--------------------------------
    // Main stat provider
    //--------------------------------


    getBattleStats(
        pokemon,
        mode = "EXACT"
    )
    {


        const prepared =

            this.resolveStatData(

                pokemon,

                mode

            );





        if(
            !this.statCalculation
        )
        {

            return prepared;

        }





        return {


            ...prepared,


            ...this.statCalculation.calculateStats(

                prepared

            )


        };


    }









    //--------------------------------
    // Resolve IV / EV / Nature
    //--------------------------------


    resolveStatData(
        pokemon,
        mode
    )
    {


        const result =

        {


            ...pokemon,


            ivs:
                {},



            evs:
                {},



            nature:

                pokemon.nature

                ||

                "HARDY"


        };









        //--------------------------------
        // Exact player Pokémon
        //--------------------------------


        if(
            mode === "EXACT"
        )
        {


            result.ivs =

                pokemon.ivs

                ||

                this.defaultIVs();



            result.evs =

                pokemon.evs

                ||

                this.defaultEVs();



            return result;


        }









        //--------------------------------
        // Best Case
        //--------------------------------


        if(
            mode === "BEST_CASE"
        )
        {


            result.ivs =

                this.maxIVs();



            result.evs =

                this.maxEVs();



            result.nature =

                this.bestNature(
                    pokemon
                );


        }









        //--------------------------------
        // Worst Case
        //--------------------------------


        if(
            mode === "WORST_CASE"
        )
        {


            result.ivs =

                this.minIVs();



            result.evs =

                this.minEVs();



            result.nature =

                "HARDY";


        }









        //--------------------------------
        // Random Case
        //--------------------------------


        if(
            mode === "RANDOM"
        )
        {


            result.ivs =

                this.randomIVs();



            result.evs =

                this.defaultEVs();



            result.nature =

                this.randomNature();


        }









        //--------------------------------
        // Average Case
        //--------------------------------


        if(
            mode === "AVERAGE_CASE"
        )
        {


            result.ivs =

                this.randomIVs();



            result.evs =

                this.defaultEVs();



            result.nature =

                "HARDY";


        }







        return result;


    }









    //--------------------------------
    // IV generators
    //--------------------------------


    maxIVs()
    {

        return {

            hp:31,

            attack:31,

            defense:31,

            spAttack:31,

            spDefense:31,

            speed:31

        };

    }









    minIVs()
    {

        return {

            hp:0,

            attack:0,

            defense:0,

            spAttack:0,

            spDefense:0,

            speed:0

        };

    }









    randomIVs()
    {

        return {

            hp:this.random31(),

            attack:this.random31(),

            defense:this.random31(),

            spAttack:this.random31(),

            spDefense:this.random31(),

            speed:this.random31()

        };

    }









    defaultIVs()
    {

        return this.randomIVs();

    }









    //--------------------------------
    // EV generators
    //--------------------------------


    maxEVs()
    {

        return {

            hp:252,

            attack:252,

            defense:252,

            spAttack:252,

            spDefense:252,

            speed:252

        };

    }









    minEVs()
    {

        return {

            hp:0,

            attack:0,

            defense:0,

            spAttack:0,

            spDefense:0,

            speed:0

        };

    }









    defaultEVs()
    {

        return this.minEVs();

    }









    //--------------------------------
    // Nature
    //--------------------------------


    bestNature(
        pokemon
    )
    {


        if(
            pokemon.category === "SPECIAL"
        )
        {

            return "MODEST";

        }



        return "ADAMANT";


    }









    randomNature()
    {


        const natures =

        [

            "ADAMANT",

            "MODEST",

            "JOLLY",

            "TIMID",

            "BOLD",

            "CALM",

            "CAREFUL",

            "IMPISH",

            "HARDY"

        ];





        return natures[

            Math.floor(

                Math.random()

                *

                natures.length

            )

        ];


    }









    //--------------------------------
    // Random helper
    //--------------------------------


    random31()
    {

        return Math.floor(

            Math.random()

            *

            32

        );

    }



}





module.exports =
    PokemonStatProviderService;