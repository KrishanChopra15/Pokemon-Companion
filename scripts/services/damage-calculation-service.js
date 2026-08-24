/**
 * Pokémon Companion
 * Damage Calculation Service
 *
 * Calculates Pokémon battle damage.
 *
 * Gen 3 FireRed mechanics.
 *
 * Responsibilities:
 * - Calculate damage formula.
 * - Apply STAB.
 * - Apply type effectiveness.
 * - Apply critical hits.
 * - Apply random factor.
 * - Apply burn modifier.
 * - Apply stat stages.
 * - Apply weather.
 *
 * Does NOT:
 * - Modify HP.
 * - Execute moves.
 * - Manage battle.
 */

"use strict";


class DamageCalculationService {



    constructor(
        typeEffectivenessService = null,
        statusEffectService = null
    )
    {


        this.typeEffectiveness =
            typeEffectivenessService;



        this.statusEffect =
            statusEffectService;



        //--------------------------------
        // Gen 3 random damage range
        //--------------------------------

        this.randomMin =
            217;


        this.randomMax =
            255;



        //--------------------------------
        // Critical hit rates
        //--------------------------------

        this.criticalRates =
        {

            NORMAL:
                16,


            HIGH:
                8

        };


    }








    //--------------------------------
    // Main damage calculation
    //--------------------------------


    calculateDamage(
        attacker,
        defender,
        move,
        context = {}
    )
    {


        console.log("\n==============================");
        console.log("DAMAGE CALCULATION START");
        console.log("==============================");



        console.log(
            "RAW ATTACKER:",
            {
                species:
                    attacker?.species,

                level:
                    attacker?.level,

                types:
                    attacker?.types

                    ||

                    attacker?.type
            }
        );



        console.log(
            "RAW DEFENDER:",
            {
                species:
                    defender?.species,

                level:
                    defender?.level,

                types:
                    defender?.types

                    ||

                    defender?.type
            }
        );



        console.log(
            "RAW MOVE:",
            move
        );





        if(
            !attacker ||
            !defender ||
            !move
        )
        {

            console.log(
                "INVALID DATA"
            );

            return 0;

        }







        const level =
            attacker.level || 1;



        const power =
            move.power || 0;




        console.log(
            "LEVEL:",
            level
        );


        console.log(
            "POWER:",
            power
        );





        if(
            power <= 0
        )
        {

            console.log(
                "ZERO POWER MOVE"
            );

            return 0;

        }








        const struggle =

            move.constant === "MOVE_STRUGGLE"

            ||

            move.name === "STRUGGLE";




        console.log(
            "IS STRUGGLE:",
            struggle
        );







        const critical =

            struggle

            ?

            false

            :

            (
                context.forceCritical
                ??
                this.checkCriticalHit(move)
            );



        console.log(
            "CRITICAL:",
            critical
        );







        let attack;

        let defense;





        if(
            critical
        )
        {

            attack =
                this.getRawAttack(
                    attacker,
                    move
                );


            defense =
                this.getRawDefense(
                    defender,
                    move
                );

        }

        else
        {

            attack =
                this.getAttack(
                    attacker,
                    move
                );


            defense =
                this.getDefense(
                    defender,
                    move
                );

        }







        console.log(
            "CALCULATED STATS:",
            {
                attack,
                defense
            }
        );









        //--------------------------------
        // Burn modifier
        //--------------------------------


        if(

            !critical

            &&

            move.category === "PHYSICAL"

            &&

            this.isBurned(attacker)

        )
        {

            attack =
                Math.floor(
                    attack / 2
                );


            console.log(
                "BURN APPLIED:",
                attack
            );

        }









        //--------------------------------
        // Gen 3 formula
        //--------------------------------


        let damage =

            Math.floor(

                (

                    (

                        (

                            (

                                2 *

                                level

                            )

                            /

                            5

                        )

                        +

                        2

                    )

                    *

                    power

                    *

                    attack

                    /

                    defense

                )

            );



        console.log(
            "BEFORE DIVIDE 50:",
            damage
        );





        damage =

            Math.floor(
                damage / 50
            );


        damage += 2;



        console.log(
            "BASE DAMAGE:",
            damage
        );








        if(
            critical
        )
        {

            damage *= 2;


            console.log(
                "CRIT DAMAGE:",
                damage
            );

        }








        //--------------------------------
        // STAB
        //--------------------------------


        const stab =

            this.hasSTAB(
                attacker,
                move
            );



        console.log(
            "STAB CHECK:",
            {
                moveType:
                    move.type,

                pokemonTypes:
                    attacker.types
                    ||
                    attacker.type,

                result:
                    stab
            }
        );





        if(
            !struggle
            &&
            stab
        )
        {

            damage =

                Math.floor(
                    damage * 3 / 2
                );


            console.log(
                "AFTER STAB:",
                damage
            );

        }





        //--------------------------------
        // Type effectiveness
        //--------------------------------


        const defenderTypes =

            defender.types

            ||

            defender.type

            ||

            [
                "NORMAL"
            ];



        console.log(
            "TYPE INPUT:",
            {
                moveType:
                    move.type,

                defenderTypes
            }
        );





        let multiplier =

            this.getTypeMultiplier(

                move.type,

                defenderTypes,

                context

            );





        console.log(
            "TYPE MULTIPLIER:",
            multiplier
        );







        //--------------------------------
        // Struggle ignores typing
        //--------------------------------


        if(
            struggle
        )
        {

            multiplier = 1;


            console.log(
                "STRUGGLE TYPE OVERRIDE"
            );

        }







        if(
            multiplier === 0
        )
        {

            console.log(
                "IMMUNITY"
            );

            return 0;

        }







        damage =

            Math.floor(

                damage *

                multiplier

            );



        console.log(
            "AFTER TYPE:",
            damage
        );









        //--------------------------------
        // Weather
        //--------------------------------


        if(

            !struggle

            &&

            typeof context.weatherMultiplier === "number"

        )
        {

            damage =

                Math.floor(

                    damage *

                    context.weatherMultiplier

                );


            console.log(
                "AFTER WEATHER:",
                damage
            );

        }









        //--------------------------------
        // Random factor
        //--------------------------------


        const random =

            Math.floor(

                Math.random()

                *

                (

                    this.randomMax

                    -

                    this.randomMin

                    +

                    1

                )

                +

                this.randomMin

            );



        console.log(
            "RANDOM:",
            random
        );





        damage =

            Math.floor(

                damage *

                random

            );



        damage =

            Math.floor(

                damage /

                255

            );





        console.log(
            "FINAL DAMAGE:",
            damage
        );



        console.log(
            "=============================="
        );

        console.log(
            "DAMAGE CALCULATION END\n"
        );




        return Math.max(
            1,
            damage
        );


    }









    //--------------------------------
    // Critical hit
    //--------------------------------


    checkCriticalHit(
        move
    )
    {


        let rate =

            this.criticalRates.NORMAL;



        if(
            move?.criticalRate === "HIGH"
        )
        {

            rate =
                this.criticalRates.HIGH;

        }




        return (

            Math.floor(
                Math.random() * rate
            )

            ===

            0

        );


    }









    //--------------------------------
    // Attack stat
    //--------------------------------


    getAttack(
        pokemon,
        move
    )
    {


        const special =

            move.category === "SPECIAL";



        let stat =

            special

            ?

            pokemon.spAttack

            :

            pokemon.attack;



        const stage =

            special

            ?

            pokemon.statStages?.specialAttack

            :

            pokemon.statStages?.attack;



        stat =
            stat || 1;



        return Math.floor(

            stat *

            this.getStageMultiplier(
                stage || 0
            )

        );


    }









    //--------------------------------
    // Defense stat
    //--------------------------------


    getDefense(
        pokemon,
        move
    )
    {


        const special =

            move.category === "SPECIAL";



        let stat =

            special

            ?

            pokemon.spDefense

            :

            pokemon.defense;



        const stage =

            special

            ?

            pokemon.statStages?.specialDefense

            :

            pokemon.statStages?.defense;



        stat =
            stat || 1;



        return Math.floor(

            stat *

            this.getStageMultiplier(
                stage || 0
            )

        );


    }









    //--------------------------------
    // Raw stats
    //--------------------------------


    getRawAttack(
        pokemon,
        move
    )
    {


        return (

            move.category === "SPECIAL"

            ?

            pokemon.spAttack

            :

            pokemon.attack

        )

        ||

        1;


    }







    getRawDefense(
        pokemon,
        move
    )
    {


        return (

            move.category === "SPECIAL"

            ?

            pokemon.spDefense

            :

            pokemon.defense

        )

        ||

        1;


    }









    //--------------------------------
    // Stage multiplier
    //--------------------------------


    getStageMultiplier(
        stage = 0
    )
    {


        const stages =
        [

            [2,8],
            [2,7],
            [2,6],
            [2,5],
            [2,4],
            [2,3],
            [1,1],
            [3,2],
            [4,2],
            [5,2],
            [6,2],
            [7,2],
            [8,2]

        ];



        const safe =

            Math.max(
                -6,
                Math.min(6, stage)
            );



        const value =
            stages[safe + 6];



        return value[0] / value[1];


    }









    //--------------------------------
    // STAB
    //--------------------------------


    hasSTAB(
        pokemon,
        move
    )
    {


        if(
            !pokemon ||
            !move
        )
        {
            return false;
        }





        const pokemonTypes =

            pokemon.types

            ||

            pokemon.type;





        if(
            !pokemonTypes
        )
        {
            return false;
        }





        const types =

            Array.isArray(
                pokemonTypes
            )

            ?

            pokemonTypes

            :

            [
                pokemonTypes
            ];





        return types.some(

            type =>

                this.normalizeType(type)

                ===

                this.normalizeType(move.type)

        );


    }









    //--------------------------------
    // Type multiplier
    //--------------------------------


    getTypeMultiplier(
        moveType,
        defenderTypes,
        context = {}
    )
    {


        if(
            !this.typeEffectiveness
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





        return this.typeEffectiveness.getMultiplier(

            moveType,

            defenderTypes,

            context

        );


    }









    //--------------------------------
    // Burn
    //--------------------------------


    isBurned(
        pokemon
    )
    {


        return (

            pokemon?.status === "BURN"

            ||

            pokemon?.status?.name === "BURN"

        );


    }









    //--------------------------------
    // Normalize types
    //--------------------------------


    normalizeType(
        type
    )
    {


        if(
            !type
        )
        {
            return "";
        }





        if(
            typeof type === "object"
        )
        {

            return String(

                type.constant

                ||

                type.name

                ||

                ""

            )

            .replace(
                "TYPE_",
                ""
            )

            .toUpperCase();

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
    DamageCalculationService;