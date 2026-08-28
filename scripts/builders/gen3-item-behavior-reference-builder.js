/**
 * Pokémon Companion
 * Generation III Item Behavior Reference Builder
 *
 * Builds the normalized Generation III item behavior
 * reference database.
 *
 * Responsibilities:
 * - Combine item identity.
 * - Combine normalized item effects.
 * - Apply Generation III semantic behavior rules.
 * - Produce normalized behavior records.
 *
 * Does NOT:
 * - Read source files.
 * - Parse C code.
 * - Execute item behavior.
 * - Modify Pokémon.
 * - Manage inventory.
 * - Define game-specific item availability.
 * - Define game-specific item metadata.
 */

"use strict";


const Gen3ItemBehaviors =
    require("../rules/gen3-item-behaviors");


class Gen3ItemBehaviorReferenceBuilder
{


    //----------------------------------------
    // Build item behavior database
    //----------------------------------------

    build(
        items,
        itemEffects
    )
    {

        if(
            !Array.isArray(
                items
            )
        )
        {

            throw new TypeError(
                "Items must be an array."
            );

        }


        if(
            !Array.isArray(
                itemEffects
            )
        )
        {

            throw new TypeError(
                "Item effects must be an array."
            );

        }


        //----------------------------------------
        // Create effect lookup
        //----------------------------------------

        const effectMap =
            new Map();


        for(
            const effect of itemEffects
        )
        {

            if(
                !effect ||
                !effect.constant
            )
            {

                continue;

            }


            effectMap.set(
                effect.constant,
                effect
            );

        }


        //----------------------------------------
        // Build records
        //----------------------------------------

        const behaviors =
            [];


        for(
            const item of items
        )
        {

            if(
                !item ||
                !item.constant
            )
            {

                continue;

            }


            //--------------------------------
            // Find Generation III behavior
            //--------------------------------

            const rule =
                Gen3ItemBehaviors[
                    item.constant
                ];


            //--------------------------------
            // Only generate behavior records
            // for explicitly defined rules.
            //--------------------------------

            if(
                !rule
            )
            {

                continue;

            }


            //--------------------------------
            // Find normalized item effect
            //--------------------------------

            const effect =
                effectMap.get(
                    item.constant
                );


            //--------------------------------
            // Build normalized record
            //--------------------------------

            const record =
                this.buildRecord(

                    item,

                    effect,

                    rule

                );


            behaviors.push(
                record
            );

        }


        return behaviors;

    }


    //----------------------------------------
    // Build one behavior record
    //----------------------------------------

    buildRecord(
        item,
        effect,
        rule
    )
    {

        const record =
        {

            id:
                item.id,

            itemConstant:
                item.constant,

            name:
                item.name,

            //--------------------------------
            // Semantic behavior
            //--------------------------------

            category:
                rule.category,

            behavior:
                rule.behavior

        };


        //--------------------------------
        // Optional behavior properties
        //--------------------------------

        this.copyIfDefined(
            record,
            rule,
            "amount"
        );


        this.copyIfDefined(
            record,
            rule,
            "status"
        );


        this.copyIfDefined(
            record,
            rule,
            "stat"
        );


        this.copyIfDefined(
            record,
            rule,
            "stages"
        );


        this.copyIfDefined(
            record,
            rule,
            "duration"
        );


        this.copyIfDefined(
            record,
            rule,
            "scope"
        );


        //--------------------------------
        // Item identity
        //--------------------------------

        record.item =
        {

            id:
                item.id,

            constant:
                item.constant,

            name:
                item.name

        };


        //--------------------------------
        // Existing normalized effects
        //--------------------------------

        record.effects =
            effect
            &&
            Array.isArray(
                effect.effects
            )
            ?
            effect.effects
            :
            [];


        //--------------------------------
        // Source effect information
        //--------------------------------

        if(
            effect
        )
        {

            record.source =
            {

                effectDefinition:
                    effect.effectDefinition,

                rawFields:
                    effect.rawFields

            };

        }


        return record;

    }


    //----------------------------------------
    // Copy optional property
    //----------------------------------------

    copyIfDefined(
        target,
        source,
        property
    )
    {

        if(
            Object.prototype.hasOwnProperty.call(
                source,
                property
            )
        )
        {

            target[
                property
            ] =
                source[
                    property
                ];

        }

    }


}


module.exports =
    Gen3ItemBehaviorReferenceBuilder;