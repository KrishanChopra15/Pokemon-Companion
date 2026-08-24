/**
 * Pokémon Companion
 * Stat Calculation Service
 *
 * Calculates Pokémon battle stats.
 *
 * Gen 3 FireRed mechanics.
 *
 * Responsibilities:
 * - Calculate HP.
 * - Calculate Attack.
 * - Calculate Defense.
 * - Calculate Special Attack.
 * - Calculate Special Defense.
 * - Calculate Speed.
 * - Apply stat stages.
 * - Apply natures.
 * - Apply ability modifiers.
 *
 * Does NOT:
 * - Calculate damage.
 * - Handle type effectiveness.
 * - Handle weather.
 */

"use strict";





class StatCalculationService {



    constructor(
        statStageService = null,
        abilityService = null
    )
    {


        this.statStage =
            statStageService;


        this.ability =
            abilityService;



        //--------------------------------
        // Gen 3 nature modifiers
        //--------------------------------


        this.natureModifiers =
        {

            ADAMANT:
            {
                increase:"attack",
                decrease:"spAttack"
            },


            MODEST:
            {
                increase:"spAttack",
                decrease:"attack"
            },


            JOLLY:
            {
                increase:"speed",
                decrease:"spAttack"
            },


            TIMID:
            {
                increase:"speed",
                decrease:"attack"
            },


            BOLD:
            {
                increase:"defense",
                decrease:"attack"
            },


            CALM:
            {
                increase:"spDefense",
                decrease:"attack"
            },


            CAREFUL:
            {
                increase:"spDefense",
                decrease:"spAttack"
            },


            IMPISH:
            {
                increase:"defense",
                decrease:"spAttack"
            }

        };


    }









    //--------------------------------
    // Calculate all stats
    //--------------------------------


    calculateStats(
        pokemon
    )
    {


        return {


            hp:

                this.calculateHP(
                    pokemon
                ),



            attack:

                this.calculateStat(
                    pokemon,
                    "attack"
                ),



            defense:

                this.calculateStat(
                    pokemon,
                    "defense"
                ),



            spAttack:

                this.calculateStat(
                    pokemon,
                    "spAttack"
                ),



            spDefense:

                this.calculateStat(
                    pokemon,
                    "spDefense"
                ),



            speed:

                this.calculateSpeed(
                    pokemon
                )


        };


    }









    //--------------------------------
    // HP calculation
    //--------------------------------


    calculateHP(
        pokemon
    )
    {


        const base =
            this.getBaseStat(
                pokemon,
                "hp"
            );



        const iv =
            this.getIV(
                pokemon,
                "hp"
            );



        const ev =
            this.getEV(
                pokemon,
                "hp"
            );



        const level =
            pokemon.level || 1;



        return Math.floor(

            (

                (

                    (

                        2 *

                        base

                    )

                    +

                    iv

                    +

                    Math.floor(
                        ev / 4
                    )

                )

                *

                level

                /

                100

            )

            +

            level

            +

            10

        );


    }









    //--------------------------------
    // Normal stats
    //--------------------------------


    calculateStat(
        pokemon,
        stat
    )
    {


        const base =
            this.getBaseStat(
                pokemon,
                stat
            );



        const iv =
            this.getIV(
                pokemon,
                stat
            );



        const ev =
            this.getEV(
                pokemon,
                stat
            );



        const level =
            pokemon.level || 1;



        let value =

            Math.floor(

                (

                    (

                        (

                            2 *

                            base

                        )

                        +

                        iv

                        +

                        Math.floor(
                            ev / 4
                        )

                    )

                    *

                    level

                    /

                    100

                )

                +

                5

            );







        value =

            this.applyNature(
                pokemon,
                stat,
                value
            );







        value =

            this.applyStage(
                pokemon,
                stat,
                value
            );







        value =

            this.applyAbility(
                pokemon,
                stat,
                value
            );





        return value;


    }









    //--------------------------------
    // Speed
    //--------------------------------


    calculateSpeed(
        pokemon
    )
    {


        let speed =

            this.calculateStat(
                pokemon,
                "speed"
            );





        if(
            pokemon.status === "PARALYSIS"
        )
        {

            speed =

                Math.floor(
                    speed / 4
                );

        }





        return speed;


    }









    //--------------------------------
    // Base stat getter
    //--------------------------------


    getBaseStat(
        pokemon,
        stat
    )
    {


        return (

            pokemon.baseStats?.[stat]

            ||

            pokemon[
                "base" +
                stat.charAt(0).toUpperCase()
                +
                stat.slice(1)
            ]

            ||

            1

        );


    }









    //--------------------------------
    // IV getter
    //--------------------------------


    getIV(
        pokemon,
        stat
    )
    {


        return (

            pokemon.ivs?.[stat]

            ??

            pokemon.iv

            ??

            0

        );


    }









    //--------------------------------
    // EV getter
    //--------------------------------


    getEV(
        pokemon,
        stat
    )
    {


        return (

            pokemon.evs?.[stat]

            ??

            0

        );


    }









    //--------------------------------
    // Nature
    //--------------------------------


    applyNature(
        pokemon,
        stat,
        value
    )
    {


        const nature =

            pokemon.nature?.toUpperCase();



        const modifier =

            this.natureModifiers[nature];



        if(
            !modifier
        )
        {

            return value;

        }





        if(
            modifier.increase === stat
        )
        {

            return Math.floor(
                value * 1.1
            );

        }





        if(
            modifier.decrease === stat
        )
        {

            return Math.floor(
                value * 0.9
            );

        }





        return value;


    }









    //--------------------------------
    // Stat stages
    //--------------------------------


    applyStage(
        pokemon,
        stat,
        value
    )
    {


        if(
            this.statStage
        )
        {

            return this.statStage.getModifiedStat(

                pokemon,

                stat,

                value

            );

        }



        return value;


    }









    //--------------------------------
    // Abilities
    //--------------------------------


    applyAbility(
        pokemon,
        stat,
        value
    )
    {


        if(
            !this.ability
        )
        {

            return value;

        }




        if(
            stat === "attack"

            &&

            this.ability.modifyAttack
        )
        {

            value =
                this.ability.modifyAttack(
                    pokemon,
                    value
                );

        }




        if(
            stat === "speed"

            &&

            this.ability.modifySpeed
        )
        {

            value =
                this.ability.modifySpeed(
                    pokemon,
                    value
                );

        }




        return value;


    }









    //--------------------------------
    // Compare speed
    //--------------------------------


    compareSpeed(
        pokemon1,
        pokemon2
    )
    {


        const speed1 =
            this.calculateSpeed(
                pokemon1
            );


        const speed2 =
            this.calculateSpeed(
                pokemon2
            );



        if(
            speed1 > speed2
        )
        {
            return pokemon1;
        }



        if(
            speed2 > speed1
        )
        {
            return pokemon2;
        }



        return null;


    }



}





module.exports =
    StatCalculationService;