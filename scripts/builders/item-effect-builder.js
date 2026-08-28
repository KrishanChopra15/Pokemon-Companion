/**
 * Pokémon Companion
 * Item Effect Builder
 *
 * Converts parsed FireRed item effect definitions
 * into semantic Pokémon Companion effects.
 *
 * Responsibilities:
 * - Interpret parsed item effect fields.
 * - Build semantic effects.
 * - Normalize FireRed implementation details.
 *
 * Does NOT:
 * - Read source files.
 * - Parse C source syntax.
 * - Resolve item references.
 * - Write databases.
 * - Execute item effects.
 */

"use strict";


class ItemEffectBuilder
{


    //----------------------------------------
    // Build all item effects
    //----------------------------------------

    build(
        definitions,
        mappings,
        itemIds = new Map()
    )
    {

        const definitionMap =
            new Map();


        for(
            const definition of definitions
        )
        {

            definitionMap.set(
                definition.name,
                definition
            );

        }


        const records =
            [];


        for(
            const mapping of mappings
        )
        {

            const definition =
                definitionMap.get(
                    mapping.effectName
                );


            if(
                !definition
            )
            {

                continue;

            }


            records.push(

                this.buildRecord(

                    mapping,
                    definition,
                    itemIds

                )

            );

        }


        return records;

    }


    //----------------------------------------
    // Build item record
    //----------------------------------------

    buildRecord(
        mapping,
        definition,
        itemIds
    )
    {

        return {

            id:
                itemIds.get(
                    mapping.itemConstant
                )
                ??
                null,

            constant:
                mapping.itemConstant,

            effectDefinition:
                definition.name,

            rawFields:
                {
                    ...definition.fields
                },

            effects:
                this.buildSemanticEffects(
                    definition
                )

        };

    }


    //----------------------------------------
    // Build semantic effects
    //----------------------------------------

    buildSemanticEffects(
        definition
    )
    {

        const fields =
            definition.fields;


        const effects =
            [];


        this.buildField0Effects(
            fields,
            effects
        );


        this.buildField1Effects(
            fields,
            effects
        );


        this.buildField2Effects(
            fields,
            effects
        );


        this.buildField3Effects(
            fields,
            effects
        );


        this.buildField4Effects(
            fields,
            effects
        );


        this.buildField5Effects(
            fields,
            effects
        );


        this.applyArguments(
            fields,
            effects
        );


        this.applyFriendshipEffects(
            fields,
            effects
        );


        this.normalizeEffects(
            fields,
            effects
        );


        return effects;

    }


    //----------------------------------------
    // Field 0
    //----------------------------------------

    buildField0Effects(
        fields,
        effects
    )
    {

        const value =
            fields[0];


        if(
            this.contains(
                value,
                "ITEM0_X_ATTACK"
            )
        )
        {

            effects.push({

                type:
                    "STAT_STAGE",

                stat:
                    "ATTACK",

                stages:
                    1

            });

        }


        if(
            this.contains(
                value,
                "ITEM0_DIRE_HIT"
            )
            ||
            this.isDireHitValue(
                value
            )
        )
        {

            effects.push({

                type:
                    "CRITICAL_HIT_STAGE",

                stages:
                    2

            });

        }


        if(
            this.contains(
                value,
                "ITEM0_SACRED_ASH"
            )
        )
        {

            effects.push({

                type:
                    "SACRED_ASH"

            });

        }


        if(
            this.contains(
                value,
                "ITEM0_INFATUATION"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "INFATUATION"

            });

        }

    }


    //----------------------------------------
    // Field 1
    //----------------------------------------

    buildField1Effects(
        fields,
        effects
    )
    {

        const value =
            fields[1];


        if(
            this.contains(
                value,
                "ITEM1_X_SPEED"
            )
        )
        {

            effects.push({

                type:
                    "STAT_STAGE",

                stat:
                    "SPEED",

                stages:
                    1

            });

        }


        if(
            this.contains(
                value,
                "ITEM1_X_DEFEND"
            )
        )
        {

            effects.push({

                type:
                    "STAT_STAGE",

                stat:
                    "DEFENSE",

                stages:
                    1

            });

        }

    }


    //----------------------------------------
    // Field 2
    //----------------------------------------

    buildField2Effects(
        fields,
        effects
    )
    {

        const value =
            fields[2];


        if(
            this.contains(
                value,
                "ITEM2_X_SPATK"
            )
        )
        {

            effects.push({

                type:
                    "STAT_STAGE",

                stat:
                    "SPECIAL_ATTACK",

                stages:
                    1

            });

        }


        if(
            this.contains(
                value,
                "ITEM2_X_ACCURACY"
            )
        )
        {

            effects.push({

                type:
                    "STAT_STAGE",

                stat:
                    "ACCURACY",

                stages:
                    1

            });

        }

    }


    //----------------------------------------
    // Field 3
    //----------------------------------------

    buildField3Effects(
        fields,
        effects
    )
    {

        const value =
            fields[3];


        if(
            this.contains(
                value,
                "ITEM3_CONFUSION"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "CONFUSION"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_PARALYSIS"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "PARALYSIS"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_FREEZE"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "FREEZE"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_BURN"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "BURN"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_POISON"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "POISON"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_SLEEP"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "SLEEP"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_STATUS_ALL"
            )
        )
        {

            effects.push({

                type:
                    "CURE_STATUS",

                status:
                    "ALL"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_LEVEL_UP"
            )
        )
        {

            effects.push({

                type:
                    "LEVEL_UP"

            });

        }


        if(
            this.contains(
                value,
                "ITEM3_GUARD_SPEC"
            )
        )
        {

            effects.push({

                type:
                    "GUARD_SPEC"

            });

        }

    }


    //----------------------------------------
    // Field 4
    //----------------------------------------

    buildField4Effects(
        fields,
        effects
    )
    {

        const value =
            fields[4];


        if(
            this.contains(
                value,
                "ITEM4_EV_HP"
            )
        )
        {

            effects.push({

                type:
                    "EV_CHANGE",

                stat:
                    "HP"

            });

        }


        if(
            this.contains(
                value,
                "ITEM4_EV_ATK"
            )
        )
        {

            effects.push({

                type:
                    "EV_CHANGE",

                stat:
                    "ATTACK"

            });

        }


        if(
            this.contains(
                value,
                "ITEM4_HEAL_HP"
            )
        )
        {

            effects.push({

                type:
                    "HEAL_HP"

            });

        }


        if(
            this.contains(
                value,
                "ITEM4_HEAL_PP_ALL"
            )
        )
        {

            effects.push({

                type:
                    "HEAL_PP",

                scope:
                    "ALL"

            });

        }


        if(
            this.contains(
                value,
                "ITEM4_HEAL_PP_ONE"
            )
        )
        {

            effects.push({

                type:
                    "HEAL_PP",

                scope:
                    "ONE"

            });

        }


        if(
            this.contains(
                value,
                "ITEM4_PP_UP"
            )
        )
        {

            effects.push({

                type:
                    "PP_UP"

            });

        }


        if(
            this.contains(
                value,
                "ITEM4_REVIVE"
            )
        )
        {

            effects.push({

                type:
                    "REVIVE"

            });

        }


        if(
            this.contains(
                value,
                "ITEM4_EVO_STONE"
            )
        )
        {

            effects.push({

                type:
                    "EVOLUTION_STONE"

            });

        }

    }


    //----------------------------------------
    // Field 5
    //----------------------------------------

    buildField5Effects(
        fields,
        effects
    )
    {

        const value =
            fields[5];


        if(
            this.contains(
                value,
                "ITEM5_EV_DEF"
            )
        )
        {

            effects.push({

                type:
                    "EV_CHANGE",

                stat:
                    "DEFENSE"

            });

        }


        if(
            this.contains(
                value,
                "ITEM5_EV_SPEED"
            )
        )
        {

            effects.push({

                type:
                    "EV_CHANGE",

                stat:
                    "SPEED"

            });

        }


        if(
            this.contains(
                value,
                "ITEM5_EV_SPDEF"
            )
        )
        {

            effects.push({

                type:
                    "EV_CHANGE",

                stat:
                    "SPECIAL_DEFENSE"

            });

        }


        if(
            this.contains(
                value,
                "ITEM5_EV_SPATK"
            )
        )
        {

            effects.push({

                type:
                    "EV_CHANGE",

                stat:
                    "SPECIAL_ATTACK"

            });

        }


        if(
            this.contains(
                value,
                "ITEM5_PP_MAX"
            )
        )
        {

            effects.push({

                type:
                    "PP_MAX"

            });

        }

    }


    //----------------------------------------
    // Apply arguments
    //----------------------------------------

    applyArguments(
        fields,
        effects
    )
    {

        const value =
            fields[6];


        if(
            !value
        )
        {

            return;

        }


        //--------------------------------
        // Full HP
        //--------------------------------

        if(
            this.contains(
                value,
                "ITEM6_HEAL_HP_FULL"
            )
        )
        {

            this.setEffectValue(

                effects,

                "HEAL_HP",

                "amount",

                "FULL"

            );

        }


        //--------------------------------
        // Half HP
        //--------------------------------

        else if(
            this.contains(
                value,
                "ITEM6_HEAL_HP_HALF"
            )
        )
        {

            this.setEffectValue(

                effects,

                "REVIVE",

                "hp",

                "HALF"

            );

        }


        //--------------------------------
        // Level-up HP
        //--------------------------------

        else if(
            this.contains(
                value,
                "ITEM6_HEAL_HP_LVL_UP"
            )
        )
        {

            this.removeEffectType(
                effects,
                "HEAL_HP"
            );

        }


        //--------------------------------
        // Full PP
        //--------------------------------

        else if(
            this.contains(
                value,
                "ITEM6_HEAL_PP_FULL"
            )
        )
        {

            for(
                const effect of effects
            )
            {

                if(
                    effect.type ===
                    "HEAL_PP"
                )
                {

                    effect.amount =
                        "FULL";

                }

            }

        }


        //--------------------------------
        // Numeric argument
        //--------------------------------

        else if(
            this.isNumber(
                value
            )
        )
        {

            const amount =
                Number(
                    value
                );


            const heal =
                this.findEffect(
                    effects,
                    "HEAL_HP"
                );


            if(
                heal
            )
            {

                heal.amount =
                    amount;

            }


            for(
                const effect of effects
            )
            {

                if(
                    effect.type ===
                    "HEAL_PP"
                )
                {

                    effect.amount =
                        amount;

                }

            }

        }


        //--------------------------------
        // EV amount
        //--------------------------------

        if(
            value ===
            "ITEM6_ADD_EV"
        )
        {

            for(
                const effect of effects
            )
            {

                if(
                    effect.type ===
                    "EV_CHANGE"
                )
                {

                    effect.amount =
                        10;

                }

            }

        }

    }


    //----------------------------------------
    // Friendship effects
    //----------------------------------------

    applyFriendshipEffects(
        fields,
        effects
    )
    {

        if(
            !Array.isArray(
                fields.__macros
            )
        )
        {

            return;

        }


        if(
            fields.__macros.includes(
                "VITAMIN_FRIENDSHIP_CHANGE"
            )
        )
        {

            effects.push({

                type:
                    "FRIENDSHIP_CHANGE",

                low:
                    5,

                mid:
                    3,

                high:
                    2

            });

        }


        if(
            fields.__macros.includes(
                "STAT_BOOST_FRIENDSHIP_CHANGE"
            )
        )
        {

            effects.push({

                type:
                    "FRIENDSHIP_CHANGE",

                low:
                    1,

                mid:
                    1

            });

        }

    }


    //----------------------------------------
    // Normalize effects
    //----------------------------------------

    normalizeEffects(
        fields,
        effects
    )
    {

        //--------------------------------
        // Revive carries HP amount
        //--------------------------------

        const revive =
            this.findEffect(
                effects,
                "REVIVE"
            );


        if(
            revive
        )
        {

            const heal =
                this.findEffect(
                    effects,
                    "HEAL_HP"
                );


            if(
                heal
                &&
                heal.amount
            )
            {

                revive.hp =
                    heal.amount;

            }

        }


        //--------------------------------
        // Revive should not also appear
        // as ordinary healing
        //--------------------------------

        if(
            revive
        )
        {

            this.removeEffectType(
                effects,
                "HEAL_HP"
            );

        }


        //--------------------------------
        // Rare Candy's internal flags
        //--------------------------------

        if(
            this.contains(
                fields[3],
                "ITEM3_LEVEL_UP"
            )
        )
        {
        
            this.removeEffectType(
                effects,
                "HEAL_HP"
            );
        
            this.removeEffectType(
                effects,
                "REVIVE"
            );
        
        }

    }


    //----------------------------------------
    // Find effect
    //----------------------------------------

    findEffect(
        effects,
        type
    )
    {

        return effects.find(

            effect =>
                effect.type ===
                type

        )
        ||
        null;

    }


    //----------------------------------------
    // Set effect property
    //----------------------------------------

    setEffectValue(
        effects,
        type,
        property,
        value
    )
    {

        const effect =
            this.findEffect(
                effects,
                type
            );


        if(
            effect
        )
        {

            effect[property] =
                value;

        }

    }


    //----------------------------------------
    // Remove effect type
    //----------------------------------------

    removeEffectType(
        effects,
        type
    )
    {

        for(
            let index =
                effects.length - 1;

            index >= 0;

            index--
        )
        {

            if(
                effects[index].type ===
                type
            )
            {

                effects.splice(
                    index,
                    1
                );

            }

        }

    }


    //----------------------------------------
    // Contains
    //----------------------------------------

    contains(
        value,
        text
    )
    {

        return (

            typeof value ===
            "string"

            &&

            value.includes(
                text
            )

        );

    }


    //----------------------------------------
    // Numeric value
    //----------------------------------------

    isNumber(
        value
    )
    {

        return (

            typeof value ===
            "string"

            &&

            /^-?\d+$/.test(
                value.trim()
            )

        );

    }


    //----------------------------------------
    // Dire Hit
    //----------------------------------------

    isDireHitValue(
        value
    )
    {

        return (
            value ===
            "2 << 4"
        );

    }

}


module.exports =
    ItemEffectBuilder;