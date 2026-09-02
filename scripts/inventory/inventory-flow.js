/**
 * Pokémon Companion
 * Inventory Flow
 *
 * Coordinates inventory actions.
 *
 * Responsibilities:
 * - Add items.
 * - Remove items.
 * - Use items.
 * - Apply Pokémon item effects.
 * - Apply party-wide item effects.
 * - Provide inventory status.
 *
 * Does NOT:
 * - Store inventory data.
 * - Handle shops.
 * - Calculate prices.
 * - Execute battle logic.
 */

"use strict";


class InventoryFlow
{


    constructor(
        inventoryManager,
        itemEffectService = null,
        itemBehaviorDatabase = null
    )
    {

        this.inventory =
            inventoryManager;


        this.itemEffectService =
            itemEffectService;


        this.itemBehaviors =
            itemBehaviorDatabase;


        this.history =
            [];

    }


    //--------------------------------
    // Receive item
    //--------------------------------

    receiveItem(
        item,
        quantity = 1
    )
    {

        const result =
            this.inventory
                .addItem(
                    item,
                    quantity
                );


        if(
            result.success
        )
        {

            this.history.push({

                action:
                    "ADD",

                item,

                quantity

            });

        }


        return result;

    }


    //--------------------------------
    // Use item
    //
    // Generic inventory consumption.
    //
    // Preserves existing behavior
    // used by systems such as capture.
    //--------------------------------

    useItem(
        item
    )
    {

        const result =
            this.inventory
                .removeItem(
                    item,
                    1
                );


        if(
            result.success
        )
        {

            this.history.push({

                action:
                    "USE",

                item

            });

        }


        return result;

    }


    //--------------------------------
    // Use item on Pokémon
    //
    // Applies the item behavior first.
    // The item is consumed only when
    // the complete effect succeeds.
    //
    // Optional move is used by:
    // - Ether
    // - Max Ether
    // - PP Up
    // - PP Max
    //--------------------------------

    useItemOnPokemon(
        item,
        pokemon,
        move = null
    )
    {

        //--------------------------------
        // Validate item
        //--------------------------------

        if(
            !item
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid item"

            };

        }


        //--------------------------------
        // Validate Pokémon
        //--------------------------------

        if(
            !pokemon
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        //--------------------------------
        // Check inventory
        //--------------------------------

        if(
            !this.inventory
                .hasItem(
                    item
                )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Item not found"

            };

        }


        //--------------------------------
        // Resolve behavior
        //--------------------------------

        const behavior =
            this.getItemBehavior(
                item
            );


        if(
            !behavior
        )
        {

            return {

                success:
                    false,

                reason:
                    `No item behavior defined for ${item}`

            };

        }


        //--------------------------------
        // Require effect service
        //--------------------------------

        if(
            !this.itemEffectService
            ||
            typeof this.itemEffectService.use !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Item effect service is not available"

            };

        }


        //--------------------------------
        // Apply effect FIRST
        //--------------------------------

        const effectResult =
            this.itemEffectService.use(

                behavior,

                pokemon,

                move

            );


        //--------------------------------
        // Do not consume item when
        // effect fails
        //--------------------------------

        if(
            !effectResult.success
        )
        {

            return {

                success:
                    false,

                reason:
                    effectResult.reason,

                item,

                behavior:
                    behavior.behavior,

                effect:
                    effectResult

            };

        }


        //--------------------------------
        // Consume item after successful use
        //--------------------------------

        const consumeResult =
            this.inventory
                .removeItem(
                    item,
                    1
                );


        //--------------------------------
        // Defensive failure handling
        //--------------------------------

        if(
            !consumeResult.success
        )
        {

            return {

                success:
                    false,

                reason:
                    "Item effect succeeded but item could not be consumed",

                item,

                behavior:
                    behavior.behavior,

                effect:
                    effectResult,

                inventory:
                    consumeResult

            };

        }


        //--------------------------------
        // Record successful use
        //--------------------------------

        this.history.push({

            action:
                "USE_ON_POKEMON",

            item,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon.species ||
                null,

            move:
                move
                &&
                (
                    move.constant
                    ||
                    move.name
                    ||
                    null
                )

        });


        //--------------------------------
        // Return successful result
        //--------------------------------

        return {

            success:
                true,

            item,

            behavior:
                behavior.behavior,

            pokemon,

            move:
                move ||
                null,

            effect:
                effectResult,

            remaining:
                this.inventory.getQuantity(
                    item
                )

        };

    }


    //--------------------------------
    // Use item on party
    //
    // Applies party-wide behavior first.
    // The item is consumed only when
    // the effect succeeds.
    //--------------------------------

    useItemOnParty(
        item,
        party
    )
    {

        //--------------------------------
        // Validate item
        //--------------------------------

        if(
            !item
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid item"

            };

        }


        //--------------------------------
        // Validate party
        //--------------------------------

        if(
            !Array.isArray(
                party
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Party must be an array"

            };

        }


        //--------------------------------
        // Check inventory
        //--------------------------------

        if(
            !this.inventory
                .hasItem(
                    item
                )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Item not found"

            };

        }


        //--------------------------------
        // Resolve behavior
        //--------------------------------

        const behavior =
            this.getItemBehavior(
                item
            );


        if(
            !behavior
        )
        {

            return {

                success:
                    false,

                reason:
                    `No item behavior defined for ${item}`

            };

        }


        //--------------------------------
        // Require party effect service
        //--------------------------------

        if(
            !this.itemEffectService
            ||
            typeof this.itemEffectService.useOnParty !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Party item effect service is not available"

            };

        }


        //--------------------------------
        // Apply effect FIRST
        //--------------------------------

        const effectResult =
            this.itemEffectService.useOnParty(

                behavior,

                party

            );


        //--------------------------------
        // Do not consume item when
        // effect fails
        //--------------------------------

        if(
            !effectResult.success
        )
        {

            return {

                success:
                    false,

                reason:
                    effectResult.reason,

                item,

                behavior:
                    behavior.behavior,

                effect:
                    effectResult

            };

        }


        //--------------------------------
        // Consume item after successful use
        //--------------------------------

        const consumeResult =
            this.inventory
                .removeItem(
                    item,
                    1
                );


        //--------------------------------
        // Defensive failure handling
        //--------------------------------

        if(
            !consumeResult.success
        )
        {

            return {

                success:
                    false,

                reason:
                    "Item effect succeeded but item could not be consumed",

                item,

                behavior:
                    behavior.behavior,

                effect:
                    effectResult,

                inventory:
                    consumeResult

            };

        }


        //--------------------------------
        // Record successful use
        //--------------------------------

        this.history.push({

            action:
                "USE_ON_PARTY",

            item,

            behavior:
                behavior.behavior,

            revived:
                effectResult.revivedCount ||
                0

        });


        //--------------------------------
        // Return successful result
        //--------------------------------

        return {

            success:
                true,

            item,

            behavior:
                behavior.behavior,

            effect:
                effectResult,

            remaining:
                this.inventory.getQuantity(
                    item
                )

        };

    }


    //--------------------------------
    // Resolve item behavior
    //--------------------------------

    getItemBehavior(
        item
    )
    {

        //--------------------------------
        // Array database
        //--------------------------------

        if(
            Array.isArray(
                this.itemBehaviors
            )
        )
        {

            return (

                this.itemBehaviors.find(

                    behavior =>

                        behavior.itemConstant ===
                        item

                )

                ||

                null

            );

        }


        //--------------------------------
        // Object database
        //--------------------------------

        if(
            this.itemBehaviors
            &&
            typeof this.itemBehaviors ===
                "object"
        )
        {

            return (

                this.itemBehaviors[item]

                ||

                null

            );

        }


        return null;

    }


    //--------------------------------
    // Remove item
    //--------------------------------

    removeItem(
        item,
        quantity = 1
    )
    {

        const result =
            this.inventory
                .removeItem(
                    item,
                    quantity
                );


        if(
            result.success
        )
        {

            this.history.push({

                action:
                    "REMOVE",

                item,

                quantity

            });

        }


        return result;

    }


    //--------------------------------
    // Inventory access
    //--------------------------------

    getInventory()
    {

        return this.inventory
            .getInventory();

    }


    //--------------------------------
    // Item quantity
    //--------------------------------

    getQuantity(
        item
    )
    {

        return this.inventory
            .getQuantity(
                item
            );

    }


    //--------------------------------
    // Check item
    //--------------------------------

    hasItem(
        item
    )
    {

        return this.inventory
            .hasItem(
                item
            );

    }


    //--------------------------------
    // History
    //--------------------------------

    getHistory()
    {

        return this.history;

    }


    //--------------------------------
    // Clear history
    //--------------------------------

    clearHistory()
    {

        this.history =
            [];

    }


}


module.exports =
    InventoryFlow;