/**
 * Pokémon Companion
 * Ability Service
 *
 * Handles Pokémon abilities.
 *
 * Responsibilities:
 * - Check active abilities.
 * - Apply ability modifiers.
 * - Handle immunities.
 * - Handle stat modifications.
 * - Handle ability triggered effects.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Manage battles.
 * - Handle weather.
 */

"use strict";





class AbilityService {



    constructor()
    {


        this.abilities =
        {


            //--------------------------------
            // Stat abilities
            //--------------------------------


            HUGE_POWER:
            {

                attackMultiplier:
                    2

            },



            PURE_POWER:
            {

                attackMultiplier:
                    2

            },



            SLOW_START:
            {

                attackMultiplier:
                    0.5,


                speedMultiplier:
                    0.5

            },





            //--------------------------------
            // Immunity abilities
            //--------------------------------


            LEVITATE:
            {

                immuneTypes:
                [

                    "TYPE_GROUND"

                ]

            },





            FLASH_FIRE:
            {

                immuneTypes:
                [

                    "TYPE_FIRE"

                ],


                boostType:
                    "TYPE_FIRE"

            },





            WATER_ABSORB:
            {

                immuneTypes:
                [

                    "TYPE_WATER"

                ],


                heal:
                    true

            },





            VOLT_ABSORB:
            {

                immuneTypes:
                [

                    "TYPE_ELECTRIC"

                ],


                heal:
                    true

            },





            //--------------------------------
            // Stat protection
            //--------------------------------


            CLEAR_BODY:
            {

                preventStatDrop:
                    true

            },





            HYPER_CUTTER:
            {

                preventAttackDrop:
                    true

            },





            //--------------------------------
            // Entry abilities
            //--------------------------------


            INTIMIDATE:
            {

                lowerEnemyAttack:
                    1

            }



        };


    }









    //--------------------------------
    // Get ability data
    //--------------------------------


    getAbility(
        pokemon
    )
    {


        if(
            !pokemon.ability
        )
        {

            return null;

        }



        return (

            this.abilities[

                pokemon.ability

            ]

            ||

            null

        );


    }









    //--------------------------------
    // Check ability
    //--------------------------------


    hasAbility(
        pokemon,
        ability
    )
    {


        return (

            pokemon.ability === ability

        );


    }









    //--------------------------------
    // Type immunity
    //--------------------------------


    isImmune(
        pokemon,
        moveType
    )
    {


        const ability =
            this.getAbility(
                pokemon
            );



        if(
            !ability ||
            !ability.immuneTypes
        )
        {

            return false;

        }



        return ability.immuneTypes.includes(

            moveType

        );


    }









    //--------------------------------
    // Ability attack modifier
    //--------------------------------


    modifyAttack(
        pokemon,
        value
    )
    {


        const ability =
            this.getAbility(
                pokemon
            );



        if(
            !ability ||
            !ability.attackMultiplier
        )
        {

            return value;

        }



        return Math.floor(

            value *

            ability.attackMultiplier

        );


    }









    //--------------------------------
    // Ability speed modifier
    //--------------------------------


    modifySpeed(
        pokemon,
        value
    )
    {


        const ability =
            this.getAbility(
                pokemon
            );



        if(
            !ability ||
            !ability.speedMultiplier
        )
        {

            return value;

        }



        return Math.floor(

            value *

            ability.speedMultiplier

        );


    }









    //--------------------------------
    // Prevent stat drop
    //--------------------------------


    preventsStatDrop(
        pokemon,
        stat
    )
    {


        const ability =
            this.getAbility(
                pokemon
            );



        if(
            !ability
        )
        {

            return false;

        }





        if(
            ability.preventStatDrop
        )
        {

            return true;

        }




        if(
            stat === "attack"

            &&

            ability.preventAttackDrop
        )
        {

            return true;

        }



        return false;


    }









    //--------------------------------
    // Ability triggered healing
    //--------------------------------


    absorbMove(
        pokemon,
        moveType
    )
    {


        const ability =
            this.getAbility(
                pokemon
            );



        if(
            !ability
        )
        {

            return {

                success:false

            };

        }






        if(

            ability.immuneTypes

            &&

            ability.immuneTypes.includes(

                moveType

            )

            &&

            ability.heal

        )
        {

            return {

                success:true,

                heal:true,

                amount:

                    Math.floor(

                        pokemon.maxHP / 4

                    )

            };

        }



        return {

            success:false

        };


    }









    //--------------------------------
    // Fire boost
    //--------------------------------


    boostsType(
        pokemon,
        moveType
    )
    {


        const ability =
            this.getAbility(
                pokemon
            );



        if(
            !ability
        )
        {

            return false;

        }



        return (

            ability.boostType === moveType

        );


    }









    //--------------------------------
    // Get all abilities
    //--------------------------------


    getAllAbilities()
    {

        return Object.keys(

            this.abilities

        );


    }



}





module.exports =
    AbilityService;