/**
 * Pokémon Companion
 * Type Effectiveness Service
 *
 * Handles Pokémon type interactions.
 *
 * Responsibilities:
 * - Calculate type multipliers.
 * - Handle dual types.
 * - Handle immunities.
 * - Handle Foresight style overrides.
 *
 * Does NOT:
 * - Calculate damage.
 * - Apply STAB.
 * - Handle abilities.
 */

"use strict";





class TypeEffectivenessService {



    constructor()
    {


        this.chart =
        {


            NORMAL:
            {
                ROCK:0.5,
                GHOST:0,
                STEEL:0.5
            },


            FIRE:
            {
                FIRE:0.5,
                WATER:0.5,
                GRASS:2,
                ICE:2,
                BUG:2,
                ROCK:0.5,
                DRAGON:0.5,
                STEEL:2
            },


            WATER:
            {
                FIRE:2,
                WATER:0.5,
                GRASS:0.5,
                GROUND:2,
                ROCK:2,
                DRAGON:0.5
            },


            ELECTRIC:
            {
                WATER:2,
                ELECTRIC:0.5,
                GRASS:0.5,
                GROUND:0,
                FLYING:2,
                DRAGON:0.5
            },


            GRASS:
            {
                FIRE:0.5,
                WATER:2,
                GRASS:0.5,
                POISON:0.5,
                GROUND:2,
                FLYING:0.5,
                BUG:0.5,
                ROCK:2,
                DRAGON:0.5,
                STEEL:0.5
            },


            ICE:
            {
                FIRE:0.5,
                WATER:0.5,
                GRASS:2,
                ICE:0.5,
                GROUND:2,
                FLYING:2,
                DRAGON:2,
                STEEL:0.5
            },


            FIGHTING:
            {
                NORMAL:2,
                ICE:2,
                ROCK:2,
                DARK:2,
                STEEL:2,
                POISON:0.5,
                FLYING:0.5,
                PSYCHIC:0.5,
                BUG:0.5,
                GHOST:0
            },


            POISON:
            {
                GRASS:2,
                POISON:0.5,
                GROUND:0.5,
                ROCK:0.5,
                GHOST:0.5,
                STEEL:0
            },


            GROUND:
            {
                FIRE:2,
                ELECTRIC:2,
                GRASS:0.5,
                POISON:2,
                FLYING:0,
                BUG:0.5,
                ROCK:2,
                STEEL:2
            },


            FLYING:
            {
                GRASS:2,
                FIGHTING:2,
                BUG:2,
                ELECTRIC:0.5,
                ROCK:0.5,
                STEEL:0.5
            },


            PSYCHIC:
            {
                FIGHTING:2,
                POISON:2,
                PSYCHIC:0.5,
                STEEL:0.5,
                DARK:0
            },


            BUG:
            {
                GRASS:2,
                PSYCHIC:2,
                DARK:2,
                FIRE:0.5,
                FIGHTING:0.5,
                POISON:0.5,
                FLYING:0.5,
                GHOST:0.5,
                STEEL:0.5
            },


            ROCK:
            {
                FIRE:2,
                ICE:2,
                FLYING:2,
                BUG:2,
                FIGHTING:0.5,
                GROUND:0.5,
                STEEL:0.5
            },


            GHOST:
            {
                PSYCHIC:2,
                GHOST:2,
                DARK:0.5,
                NORMAL:0
            },


            DRAGON:
            {
                DRAGON:2,
                STEEL:0.5
            },


            DARK:
            {
                PSYCHIC:2,
                GHOST:2,
                FIGHTING:0.5,
                DARK:0.5,
                STEEL:0.5
            },


            STEEL:
            {
                ICE:2,
                ROCK:2,
                STEEL:0.5,
                FIRE:0.5,
                WATER:0.5,
                ELECTRIC:0.5
            }


        };


    }









    //--------------------------------
    // Calculate multiplier
    //--------------------------------


    getMultiplier(
        moveType,
        defenderTypes,
        context = {}
    )
    {


        if(
            !moveType
        )
        {

            return 1;

        }





        if(
            !Array.isArray(defenderTypes)
        )
        {

            defenderTypes =
            [
                defenderTypes
            ];

        }





        let multiplier =
            1;





        console.log(
            "TYPE MULTIPLIER START",
            {
                moveType,
                defenderTypes
            }
        );





        for(
            const defenderType of defenderTypes
        )
        {


            const value =

                this.getSingleMultiplier(

                    moveType,

                    defenderType,

                    context

                );



            console.log(
                "TYPE RESULT",
                {
                    moveType,
                    defenderType,
                    value
                }
            );



            multiplier *= value;


        }





        console.log(
            "FINAL TYPE MULTIPLIER:",
            multiplier
        );





        return multiplier;


    }









    //--------------------------------
    // Single type multiplier
    //--------------------------------


    getSingleMultiplier(
        attackType,
        defenseType,
        context
    )
    {


        attackType =

            this.normalizeType(

                attackType

            );



        defenseType =

            this.normalizeType(

                defenseType

            );





        console.log(
            "TYPE LOOKUP",
            {
                attackType,
                defenseType,
                chartValue:
                    this.chart[attackType]?.[defenseType]
            }
        );









        //--------------------------------
        // Foresight
        //--------------------------------


        if(

            context.foresight

            &&

            defenseType === "GHOST"

            &&

            (
                attackType === "NORMAL"

                ||

                attackType === "FIGHTING"

            )

        )
        {

            return 1;

        }








        const result =

            this.chart[attackType]?.[defenseType]

            ??

            1;





        return result;


    }









    //--------------------------------
    // Normalize type
    //--------------------------------


    normalizeType(
        type
    )
    {


        if(
            !type
        )
        {

            return "NORMAL";

        }





        if(
            typeof type === "object"
        )
        {


            if(
                type.constant
            )
            {

                return type.constant

                    .replace(
                        "TYPE_",
                        ""
                    )

                    .toUpperCase();

            }




            if(
                type.name
            )
            {

                return type.name.toUpperCase();

            }


        }





        return String(type)

            .replace(
                "TYPE_",
                ""
            )

            .toUpperCase();


    }



}





module.exports =
    TypeEffectivenessService;