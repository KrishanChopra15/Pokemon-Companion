/**
 * Pokémon Companion
 * Growth Rate Service
 *
 * Handles Pokémon experience growth curves.
 *
 * Responsibilities:
 * - Load growth rate references.
 * - Calculate required EXP.
 * - Calculate level from EXP.
 * - Support all growth formulas.
 *
 * Does NOT:
 * - Give EXP.
 * - Handle battles.
 * - Handle stats.
 * - Handle evolution.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class GrowthRateService {



    constructor(
        game = "firered"
    )
    {

        this.game =
            game;


        this.rates =
            this.loadDatabase();


    }









    //--------------------------------
    // Load growth rates
    //--------------------------------


    loadDatabase()
    {


        const file =
            path.join(

                process.cwd(),

                "database",

                "references",

                "growth-rates.json"

            );



        if(
            !fs.existsSync(file)
        )
        {

            return [

                {
                    id:0,
                    name:"Medium Fast",
                    constant:"GROWTH_MEDIUM_FAST"
                },

                {
                    id:1,
                    name:"Erratic",
                    constant:"GROWTH_ERRATIC"
                },

                {
                    id:2,
                    name:"Fluctuating",
                    constant:"GROWTH_FLUCTUATING"
                },

                {
                    id:3,
                    name:"Medium Slow",
                    constant:"GROWTH_MEDIUM_SLOW"
                },

                {
                    id:4,
                    name:"Fast",
                    constant:"GROWTH_FAST"
                },

                {
                    id:5,
                    name:"Slow",
                    constant:"GROWTH_SLOW"
                }

            ];

        }




        return JSON.parse(

            fs.readFileSync(

                file,

                "utf8"

            )

        );


    }









    //--------------------------------
    // Get rate
    //--------------------------------


    getRate(
        constant
    )
    {


        return this.rates.find(

            rate =>

                rate.constant === constant

        )

        ||

        null;


    }









    //--------------------------------
    // Required EXP
    //--------------------------------


    getRequiredExp(
        level,
        growthRate = "GROWTH_MEDIUM_FAST"
    )
    {


        switch(
            growthRate
        )
        {


            case "GROWTH_FAST":

                return Math.floor(

                    0.8 *

                    Math.pow(

                        level,

                        3

                    )

                );





            case "GROWTH_SLOW":

                return Math.floor(

                    1.25 *

                    Math.pow(

                        level,

                        3

                    )

                );





            case "GROWTH_MEDIUM_SLOW":

                return Math.floor(

                    (

                        (6 / 5) *

                        Math.pow(level,3)

                    )

                    -

                    (

                        15 *

                        Math.pow(level,2)

                    )

                    +

                    (

                        100 *

                        level

                    )

                    -

                    140

                );





            case "GROWTH_ERRATIC":

                return this.erratic(level);





            case "GROWTH_FLUCTUATING":

                return this.fluctuating(level);





            case "GROWTH_MEDIUM_FAST":

            default:

                return Math.pow(

                    level,

                    3

                );


        }


    }









    //--------------------------------
    // Erratic formula
    //--------------------------------


    erratic(
        level
    )
    {


        const cube =
            Math.pow(

                level,

                3

            );



        if(
            level <= 50
        )
        {

            return Math.floor(

                cube *

                (100-level)

                /

                50

            );

        }



        if(
            level <= 68
        )
        {

            return Math.floor(

                cube *

                (150-level)

                /

                100

            );

        }



        if(
            level <= 98
        )
        {

            return Math.floor(

                cube *

                ((1911 - 10 * level) / 3)

                /

                500

            );

        }



        return Math.floor(

            cube *

            (160-level)

            /

            100

        );


    }









    //--------------------------------
    // Fluctuating formula
    //--------------------------------


    fluctuating(
        level
    )
    {


        const cube =
            Math.pow(

                level,

                3

            );



        if(
            level <= 15
        )
        {

            return Math.floor(

                cube *

                (

                    (

                        (level + 1) / 3

                    )

                    +

                    24

                )

                /

                50

            );

        }





        if(
            level <= 36
        )
        {

            return Math.floor(

                cube *

                (

                    level + 14

                )

                /

                50

            );

        }





        return Math.floor(

            cube *

            (

                (

                    level / 2

                )

                +

                32

            )

            /

            50

        );


    }









    //--------------------------------
    // Calculate level from EXP
    //--------------------------------


    getLevelFromExp(
        exp,
        growthRate = "GROWTH_MEDIUM_FAST"
    )
    {


        let level =
            1;



        while(

            this.getRequiredExp(

                level + 1,

                growthRate

            )

            <=

            exp

        )
        {

            level++;


            if(
                level >= 100
            )
            {

                break;

            }

        }




        return level;


    }









    //--------------------------------
    // All rates
    //--------------------------------


    getAllRates()
    {

        return this.rates;

    }



}





module.exports =
    GrowthRateService;