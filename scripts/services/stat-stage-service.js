/**
 * Pokémon Companion
 * Stat Stage Service
 *
 * Handles battle stat stage changes.
 *
 * Responsibilities:
 * - Increase stats.
 * - Decrease stats.
 * - Calculate modified stats.
 * - Reset stat stages.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Handle abilities.
 */

"use strict";





class StatStageService {



    constructor()
    {


        this.minStage =
            -6;


        this.maxStage =
            6;



        this.stats =
        [

            "attack",

            "defense",

            "speed",

            "spAttack",

            "spDefense",

            "accuracy",

            "evasion"

        ];


    }









    //--------------------------------
    // Initialize stages
    //--------------------------------


    initialize(
        pokemon
    )
    {


        if(
            !pokemon.statStages
        )
        {

            pokemon.statStages =
            {};

        }




        for(
            const stat of this.stats
        )
        {

            if(
                pokemon.statStages[stat]
                ===
                undefined
            )
            {

                pokemon.statStages[stat]
                    =
                    0;

            }

        }



        return pokemon.statStages;


    }









    //--------------------------------
    // Increase stat
    //--------------------------------


    increase(
        pokemon,
        stat,
        amount = 1
    )
    {


        this.initialize(
            pokemon
        );



        if(
            !this.stats.includes(stat)
        )
        {

            return {

                success:false,

                reason:
                    "Unknown stat"

            };

        }




        pokemon.statStages[stat]
            +=
            amount;
            
            
            
        if(
            pokemon.statStages[stat]
            >
            this.maxStage
        )
        {
        
            pokemon.statStages[stat]
                =
                this.maxStage;
        
        }
        
        
        
        if(
            pokemon.statStages[stat]
            <
            this.minStage
        )
        {
        
            pokemon.statStages[stat]
                =
                this.minStage;
        
        }



        return {

            success:true,

            stat,

            stage:
                pokemon.statStages[stat]

        };


    }









    //--------------------------------
    // Decrease stat
    //--------------------------------


    decrease(
        pokemon,
        stat,
        amount = 1
    )
    {

        return this.increase(

            pokemon,

            stat,

            -amount

        );


    }









    //--------------------------------
    // Set stage
    //--------------------------------


    setStage(
        pokemon,
        stat,
        stage
    )
    {


        this.initialize(
            pokemon
        );



        pokemon.statStages[stat]
            =
            Math.max(

                this.minStage,

                Math.min(

                    this.maxStage,

                    stage

                )

            );



        return pokemon.statStages[stat];


    }









    //--------------------------------
    // Reset all stages
    //--------------------------------


    reset(
        pokemon
    )
    {


        pokemon.statStages =
        {};



        this.initialize(
            pokemon
        );



        return {

            success:true

        };


    }









    //--------------------------------
    // Get stage
    //--------------------------------


    getStage(
        pokemon,
        stat
    )
    {


        this.initialize(
            pokemon
        );


        return (

            pokemon.statStages[stat]

            ||

            0

        );


    }









    //--------------------------------
    // Stage multiplier
    //--------------------------------


    getMultiplier(
        stage
    )
    {


        if(
            stage >= 0
        )
        {

            return (

                2 + stage

            )

            /

            2;


        }


        else
        {

            return (

                2

            )

            /

            (

                2 - stage

            );


        }


    }









    //--------------------------------
    // Modified stat
    //--------------------------------


    getModifiedStat(
        pokemon,
        stat,
        baseValue
    )
    {


        const stage =
            this.getStage(

                pokemon,

                stat

            );



        const multiplier =
            this.getMultiplier(
                stage
            );



        return Math.floor(

            baseValue *

            multiplier

        );


    }









    //--------------------------------
    // Get all stages
    //--------------------------------


    getAllStages(
        pokemon
    )
    {

        this.initialize(
            pokemon
        );


        return pokemon.statStages;


    }



}





module.exports =
    StatStageService;