/**
 * Pokémon Companion
 * Move Effect Service
 *
 * Handles move side effects.
 *
 * Responsibilities:
 * - Apply stat changes.
 * - Apply status conditions.
 * - Handle forced switching.
 * - Handle Curse behavior.
 * - Handle generated Gen 3 move effects.
 * - Handle critical hit move properties.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Handle accuracy.
 */

"use strict";





class MoveEffectService {



    constructor(
        statStageService = null,
        statusEffectService = null
    )
    {


        this.statStage =
            statStageService;



        this.statusEffect =
            statusEffectService;





        //--------------------------------
        // Generated database effects
        //--------------------------------


        this.effectHandlers =
        {

            EFFECT_BURN_HIT:
                "BURN_HIT",



            EFFECT_SPECIAL_DEFENSE_DOWN_HIT:
                "SPECIAL_DEFENSE_DOWN_HIT",



            EFFECT_WEATHER_BALL:
                "WEATHER_BALL",



            EFFECT_MAGNITUDE:
                "MAGNITUDE",



            EFFECT_RETURN:
                "RETURN",



            //--------------------------------
            // Slash / Razor Leaf etc.
            //--------------------------------

            EFFECT_HIGH_CRITICAL:
                "HIGH_CRITICAL"


        };


    }









    //--------------------------------
    // Apply move effect
    //--------------------------------


    applyEffect(
        move,
        user,
        target,
        battle = null
    )
    {


        if(
            !move
        )
        {

            return null;

        }








        //--------------------------------
        // Custom effects
        //--------------------------------


        switch(
            move.effect
        )
        {


            case "STAT_CHANGE":

                return this.applyStatChange(
                    move,
                    user,
                    target
                );





            case "STATUS":

                return this.applyStatus(
                    move,
                    target
                );





            case "FORCED_SWITCH":

                return this.applyForcedSwitch(
                    target,
                    battle
                );





            case "CURSE":

                return this.applyCurse(
                    user,
                    target
                );


        }








        //--------------------------------
        // Generated database effects
        //--------------------------------


        if(
            this.effectHandlers[move.effect]
        )
        {


            return this.applyGeneratedEffect(

                this.effectHandlers[move.effect],

                move,

                user,

                target

            );


        }








        return {

            success:false,

            reason:
                "Unknown effect"

        };


    }









    //--------------------------------
    // Generated effects
    //--------------------------------


    applyGeneratedEffect(
        effect,
        move,
        user,
        target
    )
    {


        switch(
            effect
        )
        {


            //--------------------------------
            // Burn moves
            //--------------------------------


            case "BURN_HIT":

                return {

                    success:true,

                    status:
                        "BURN",

                    chance:
                        move.secondaryEffectChance

                };








            //--------------------------------
            // Shadow Ball
            //--------------------------------


            case "SPECIAL_DEFENSE_DOWN_HIT":

                return {

                    success:true,

                    stat:
                        "spDefense",

                    amount:
                        -1,

                    chance:
                        move.secondaryEffectChance

                };








            //--------------------------------
            // Weather Ball
            //--------------------------------


            case "WEATHER_BALL":

                return {

                    success:true,

                    transformed:
                        true

                };








            //--------------------------------
            // Magnitude
            //--------------------------------


            case "MAGNITUDE":

                return {

                    success:true,

                    magnitude:
                        move.magnitude

                };








            //--------------------------------
            // Return
            //--------------------------------


            case "RETURN":

                return {

                    success:true,

                    friendshipBased:
                        true

                };








            //--------------------------------
            // High Critical moves
            //--------------------------------
            //
            // Slash
            // Karate Chop
            // Razor Leaf
            // Crabhammer
            //
            //--------------------------------


            case "HIGH_CRITICAL":

                return {

                    success:true,

                    criticalRate:
                        "HIGH"

                };








            default:

                return {

                    success:false,

                    reason:
                        "Unknown generated effect"

                };


        }


    }









    //--------------------------------
    // Stat changes
    //--------------------------------


    applyStatChange(
        move,
        user,
        target
    )
    {


        const pokemon =
            move.target === "SELF"
            ?
            user
            :
            target;



        const results = [];





        for(
            const change of move.changes
        )
        {


            let result;



            if(
                change.amount > 0
            )
            {

                result =
                    this.statStage.increase(

                        pokemon,

                        change.stat,

                        change.amount

                    );

            }

            else
            {

                result =
                    this.statStage.decrease(

                        pokemon,

                        change.stat,

                        Math.abs(
                            change.amount
                        )

                    );

            }



            results.push(
                result
            );


        }






        return {

            success:true,

            changes:
                results

        };


    }









    //--------------------------------
    // Status effects
    //--------------------------------


    applyStatus(
        move,
        target
    )
    {


        if(
            !this.statusEffect
        )
        {

            return {

                success:false,

                reason:
                    "Status service missing"

            };

        }






        if(
            this.statusEffect.inflict
        )
        {

            return this.statusEffect.inflict(

                target,

                move.status

            );


        }






        if(
            this.statusEffect.applyStatus
        )
        {

            return this.statusEffect.applyStatus(

                target,

                move.status

            );


        }






        return {

            success:false,

            reason:
                "Unsupported status API"

        };


    }









    //--------------------------------
    // Roar / Whirlwind
    //--------------------------------


    applyForcedSwitch(
        target,
        battle
    )
    {


        return {

            success:true,

            action:
                "FORCE_SWITCH",

            pokemon:
                target.species

        };


    }









    //--------------------------------
    // Curse
    //--------------------------------


    applyCurse(
        user,
        target
    )
    {


        if(
            user.type?.includes("GHOST")
        )
        {


            user.hp =
                Math.floor(

                    user.maxHP /

                    2

                );



            target.cursed =
                true;



            return {

                success:true,

                type:
                    "GHOST_CURSE",

                damagePerTurn:
                    true

            };


        }







        return {

            success:true,

            type:
                "NORMAL_CURSE",

            changes:

            [

                {

                    stat:
                        "attack",

                    amount:
                        1

                },


                {

                    stat:
                        "defense",

                    amount:
                        1

                },


                {

                    stat:
                        "speed",

                    amount:
                        -1

                }

            ]

        };


    }



}





module.exports =
    MoveEffectService;