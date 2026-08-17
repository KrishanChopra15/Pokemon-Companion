/**
 * Pokémon Companion
 * Experience Service
 *
 * Handles Pokémon experience management.
 *
 * Responsibilities:
 * - Calculate EXP rewards.
 * - Add EXP to Pokémon.
 * - Calculate pending level increases.
 * - Provide EXP summaries.
 * - Use growth rate formulas.
 *
 * Does NOT:
 * - Apply level changes.
 * - Update stats.
 * - Execute battles.
 * - Handle moves.
 * - Handle evolution.
 * - Manage trainer progression.
 * - Load ROM data.
 */

"use strict";





class ExperienceService {



    constructor(
        growthRateService
    )
    {


        this.growthRates =
            growthRateService;



        this.baseExp =
        {

            TRAINER:
                1,


            WILD:
                1


        };


    }









    //--------------------------------
    // Calculate EXP reward
    //--------------------------------


    calculateExp(
        defeatedPokemon,
        source = "WILD"
    )
    {


        if(
            !defeatedPokemon
        )
        {

            return 0;

        }






        const base =
            defeatedPokemon.baseExp

            ||

            50;





        const level =
            defeatedPokemon.level

            ||

            1;






        const multiplier =
            this.baseExp[source]

            ||

            1;






        return Math.floor(

            (

                base *

                level *

                multiplier

            )

            /

            2

        );


    }









    //--------------------------------
    // Give EXP
    //--------------------------------


    giveExp(
        pokemon,
        amount
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
            pokemon.exp === undefined
        )
        {

            pokemon.exp =
                0;

        }








        if(
            !pokemon.level
        )
        {

            pokemon.level =
                1;

        }








        const oldLevel =
            pokemon.level;








        pokemon.exp +=
            amount;








        const levels =
            [];








        let checkLevel =
            oldLevel;








        while(

            checkLevel < 100

            &&

            pokemon.exp >=

            this.getExpRequired(

                checkLevel + 1,

                pokemon.growthRate

            )

        )
        {


            checkLevel++;


            levels.push(

                checkLevel

            );


        }








        return {


            success:true,


            gained:

                amount,


            total:

                pokemon.exp,


            oldLevel,


            currentLevel:

                oldLevel,


            levels


        };


    }









    //--------------------------------
    // EXP requirement
    //--------------------------------


    getExpRequired(
        level,
        growthRate = "GROWTH_MEDIUM_FAST"
    )
    {


        if(
            this.growthRates
        )
        {

            return this.growthRates
                .getRequiredExp(

                    level,

                    growthRate

                );

        }







        return Math.pow(

            level,

            3

        );


    }









    //--------------------------------
    // Level progress
    //--------------------------------


    getExpProgress(
        pokemon
    )
    {


        if(
            !pokemon
        )
        {

            return null;

        }






        const currentExp =
            pokemon.exp

            ||

            0;








        const growthRate =
            pokemon.growthRate

            ||

            "GROWTH_MEDIUM_FAST";








        //--------------------------------
        // Calculate actual level
        //--------------------------------


        let calculatedLevel =
            1;








        while(

            calculatedLevel < 100

            &&

            currentExp >=

            this.getExpRequired(

                calculatedLevel + 1,

                growthRate

            )

        )
        {

            calculatedLevel++;

        }








        const levelStart =
            this.getExpRequired(

                calculatedLevel,

                growthRate

            );








        const levelEnd =
            this.getExpRequired(

                calculatedLevel + 1,

                growthRate

            );








        const progress =
            Math.max(

                0,

                currentExp - levelStart

            );








        const needed =
            Math.max(

                1,

                levelEnd - levelStart

            );








        const remaining =
            Math.max(

                0,

                levelEnd - currentExp

            );








        const percentage =
            Math.min(

                100,

                Math.floor(

                    (

                        progress /

                        needed

                    )

                    *

                    100

                )

            );








        return {


            level:

                calculatedLevel,


            current:

                currentExp,


            levelStart,


            levelEnd,


            progress,


            remaining,


            percentage


        };


    }









    //--------------------------------
    // Battle reward summary
    //--------------------------------


    createReward(
        defeatedPokemon,
        source = "WILD"
    )
    {


        const exp =
            this.calculateExp(

                defeatedPokemon,

                source

            );



        return {


            pokemon:

                defeatedPokemon.species,


            level:

                defeatedPokemon.level,


            exp


        };


    }



}





module.exports =
    ExperienceService;