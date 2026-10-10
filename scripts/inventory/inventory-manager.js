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



    constructor(
        session
    )
    {


        this.session =
            session;


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








        const inventory =
            this.session
                .getState()
                .inventory;


        if(
            !inventory[item]
        )
        {

            inventory[item] =
                0;

        }








        inventory[item] +=
            quantity;








        return {

            success:true,

            item,

            quantity:
                inventory[item]

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


        const inventory =
            this.session
                .getState()
                .inventory;


        if(
            !inventory[item]
        )
        {

            return {

                success:false,

                reason:
                    "Item not found"

            };

        }








        if(
            inventory[item] < quantity
        )
        {

            return {

                success:false,

                reason:
                    "Not enough items"

            };

        }








        inventory[item] -=
            quantity;








        return {

            success:true,

            item,

            quantity:
                inventory[item]

        };


    }









    //--------------------------------
    // Check Item
    //--------------------------------


    hasItem(
        item
    )
    {


        const inventory =
            this.session
                .getState()
                .inventory;


        return Boolean(

            inventory[item]

        );


    }









    getQuantity(
        item
    )
    {


        const inventory =
            this.session
                .getState()
                .inventory;


        return inventory[item] ||
            0;


    }









    //--------------------------------
    // Inventory Access
    //--------------------------------


    getInventory()
    {


        return this.session
            .getState()
            .inventory;


    }









    clear()
    {


        const inventory =
            this.session
                .getState()
                .inventory;


        Object.keys(
            inventory
        ).forEach(

            item =>

                delete inventory[item]

        );


        return {

            success:true

        };


    }



}





module.exports =
    InventoryManager;