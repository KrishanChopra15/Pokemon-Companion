/**
 * Pokémon Companion
 * Inventory Manager
 *
 * Manages player inventory.
 *
 * Responsibilities:
 * - Store items.
 * - Add items.
 * - Remove items.
 * - Check item quantities.
 *
 * Does NOT:
 * - Handle shops.
 * - Calculate prices.
 * - Apply battle effects.
 */

"use strict";





class InventoryManager {



    constructor()
    {


        this.items = {};


    }









    //--------------------------------
    // Add Item
    //--------------------------------


    addItem(
        item,
        quantity = 1
    )
    {


        if(
            !item
        )
        {

            return {

                success:false,

                reason:
                    "Invalid item"

            };

        }








        if(
            !this.items[item]
        )
        {

            this.items[item] =
                0;

        }








        this.items[item] +=
            quantity;








        return {

            success:true,

            item,

            quantity:
                this.items[item]

        };


    }









    //--------------------------------
    // Remove Item
    //--------------------------------


    removeItem(
        item,
        quantity = 1
    )
    {


        if(
            !this.items[item]
        )
        {

            return {

                success:false,

                reason:
                    "Item not found"

            };

        }








        if(
            this.items[item] < quantity
        )
        {

            return {

                success:false,

                reason:
                    "Not enough items"

            };

        }








        this.items[item] -=
            quantity;








        return {

            success:true,

            item,

            quantity:
                this.items[item]

        };


    }









    //--------------------------------
    // Check Item
    //--------------------------------


    hasItem(
        item
    )
    {


        return Boolean(

            this.items[item]

        );


    }









    getQuantity(
        item
    )
    {


        return this.items[item] || 0;


    }









    //--------------------------------
    // Inventory Access
    //--------------------------------


    getInventory()
    {

        return this.items;

    }









    clear()
    {

        this.items = {};


        return {

            success:true

        };


    }



}





module.exports =
    InventoryManager;