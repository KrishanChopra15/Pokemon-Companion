/**
 * Pokémon Companion
 * Action Manager
 *
 * Stores player reported actions.
 *
 * Responsibilities:
 * - Record actions.
 * - Track action history.
 * - Query previous actions.
 *
 * Does NOT:
 * - Apply game effects.
 * - Modify player data directly.
 */

"use strict";


class ActionManager {


    constructor()
    {

        this.actions = [];

        this.nextId = 1;

    }






    //--------------------------------
    // Add action
    //--------------------------------


    addAction(
        action
    )
    {


        const record =
        {

            id:
                this.nextId++,


            timestamp:
                Date.now(),


            ...action


        };



        this.actions.push(
            record
        );



        return {

            success:true,

            action:record

        };


    }









    //--------------------------------
    // Get all actions
    //--------------------------------


    getAll()
    {

        return this.actions;

    }









    //--------------------------------
    // Find actions
    //--------------------------------


    findByType(
        type
    )
    {


        return this.actions.filter(

            action =>

                action.type === type

        );


    }









    //--------------------------------
    // Check action exists
    //--------------------------------


    hasAction(
        type,
        reference
    )
    {


        return this.actions.some(

            action =>


                action.type === type

                &&

                action.reference === reference


        );


    }



}





module.exports =
    ActionManager;