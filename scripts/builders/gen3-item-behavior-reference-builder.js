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
 * - Normalize friendship effects from source fields.
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
                !effect
                ||
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
                !item
                ||
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
        //
        // Clone the array so semantic
        // normalization does not mutate
        // the original item-effect database.
        //--------------------------------

        record.effects =
            effect
            &&
            Array.isArray(
                effect.effects
            )
            ?

            effect.effects.map(

                effectEntry =>

                    (

                        effectEntry
                        &&
                        typeof effectEntry ===
                            "object"

                    )

                    ?

                    {
                        ...effectEntry
                    }

                    :

                    effectEntry

            )

            :

            [];


        //--------------------------------
        // Normalize friendship effects
        // from Generation III source fields.
        //--------------------------------

        this.addSourceFriendshipEffect(
            record,
            effect
        );


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
    // Add friendship effect from source
    //
    // Generation III uses:
    //
    // ITEM5_FRIENDSHIP_ALL
    //
    // with the friendship values stored in:
    //
    // field 7 = LOW
    // field 8 = MID
    // field 9 = HIGH
    //
    // Example:
    //
    // -10
    // -10
    // -15
    //
    //----------------------------------------

    addSourceFriendshipEffect(
        record,
        effect
    )
    {

        if(
            !record
            ||
            !effect
        )
        {

            return;

        }


        const rawFields =
            effect.rawFields;


        if(
            !rawFields
            ||
            typeof rawFields !==
                "object"
        )
        {

            return;

        }


        //--------------------------------
        // Friendship trigger
        //--------------------------------

        const friendshipField =
            this.getRawField(

                rawFields,

                5

            );


        if(
            !this.contains(
                friendshipField,
                "ITEM5_FRIENDSHIP_ALL"
            )
        )
        {

            return;

        }


        //--------------------------------
        // Resolve friendship values
        //--------------------------------

        const low =
            this.toInteger(

                this.getRawField(
                    rawFields,
                    7
                )

            );


        const mid =
            this.toInteger(

                this.getRawField(
                    rawFields,
                    8
                )

            );


        const high =
            this.toInteger(

                this.getRawField(
                    rawFields,
                    9
                )

            );


        //--------------------------------
        // Require at least one valid
        // friendship value.
        //--------------------------------

        if(
            low ===
                null
            &&
            mid ===
                null
            &&
            high ===
                null
        )
        {

            return;

        }


        //--------------------------------
        // Find existing friendship effect
        //--------------------------------

        let friendshipEffect =
            record.effects.find(

                effectEntry =>

                    effectEntry
                    &&
                    effectEntry.type ===
                        "FRIENDSHIP_CHANGE"

            );


        //--------------------------------
        // Create effect when missing
        //--------------------------------

        if(
            !friendshipEffect
        )
        {

            friendshipEffect =
            {

                type:
                    "FRIENDSHIP_CHANGE"

            };


            record.effects.push(
                friendshipEffect
            );

        }


        //--------------------------------
        // Apply resolved values
        //--------------------------------

        if(
            low !==
                null
        )
        {

            friendshipEffect.low =
                low;

        }


        if(
            mid !==
                null
        )
        {

            friendshipEffect.mid =
                mid;

        }


        if(
            high !==
                null
        )
        {

            friendshipEffect.high =
                high;

        }


        //--------------------------------
        // Preserve source arguments for
        // debugging and future mechanics.
        //--------------------------------

        friendshipEffect.source =
        {

            field:
                "ITEM5_FRIENDSHIP_ALL",

            low,
            mid,
            high

        };

    }


    //----------------------------------------
    // Read raw field
    //----------------------------------------

    getRawField(
        rawFields,
        index
    )
    {

        if(
            !rawFields
        )
        {

            return undefined;

        }


        //--------------------------------
        // Numeric object key
        //--------------------------------

        if(
            Object.prototype.hasOwnProperty.call(
                rawFields,
                index
            )
        )
        {

            return rawFields[
                index
            ];

        }


        //--------------------------------
        // String object key
        //--------------------------------

        const key =
            String(
                index
            );


        if(
            Object.prototype.hasOwnProperty.call(
                rawFields,
                key
            )
        )
        {

            return rawFields[
                key
            ];

        }


        return undefined;

    }


    //----------------------------------------
    // Check string contents
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
    // Convert value to integer
    //----------------------------------------

    toInteger(
        value
    )
    {

        if(
            value ===
                undefined
            ||
            value ===
                null
        )
        {

            return null;

        }


        const number =
            Number(
                value
            );


        if(
            !Number.isFinite(
                number
            )
        )
        {

            return null;

        }


        return Math.trunc(
            number
        );

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