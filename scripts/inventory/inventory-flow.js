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
 * - Provide inventory status.
 *
 * Does NOT:
 * - Store inventory data.
 * - Handle shops.
 * - Apply Pokémon effects.
 */

"use strict";





class InventoryFlow {



    constructor(
        inventoryManager
    )
    {


        this.inventory =
            inventoryManager;


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









    getQuantity(
        item
    )
    {

        return this.inventory
            .getQuantity(
                item
            );

    }









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



}





module.exports =
    InventoryFlow;