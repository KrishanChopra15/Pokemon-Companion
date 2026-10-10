/**
 * Pokémon Companion
 * Save Data
 *
 * Represents serializable adventure data.
 *
 * Responsibilities:
 * - Store session data.
 * - Store player data.
 * - Provide save format.
 *
 * Does NOT:
 * - Write files.
 * - Load files.
 * - Manage storage.
 */

"use strict";





class SaveData {



    constructor(
        session
    )
    {


        this.version =
            1;


        this.createdAt =
            Date.now();


        this.game =
            session.game;


        //--------------------------------
        // Capture an independent snapshot
        //--------------------------------

        const seen =
            new WeakMap();


        this.player =
            this.cloneSnapshot(

                session.getPlayer(),

                seen

            );


        this.state =
            this.cloneSnapshot(

                session.getState(),

                seen

            );


    }









    //--------------------------------
    // Clone snapshot
    //
    // Copies state without retaining
    // references to live game objects.
    //
    // WeakMap preserves shared references
    // between Pokémon, team, and active
    // Pokémon state.
    //--------------------------------


    cloneSnapshot(
        value,
        seen
    )
    {


        //--------------------------------
        // Primitive values
        //--------------------------------

        if(
            value === null
            ||
            typeof value !== "object"
        )
        {

            return value;

        }








        //--------------------------------
        // Previously cloned object
        //--------------------------------

        if(
            seen.has(
                value
            )
        )
        {

            return seen.get(
                value
            );

        }








        //--------------------------------
        // Create matching container
        //--------------------------------

        const result =
            Array.isArray(
                value
            )
            ?
            []
            :
            {};


        seen.set(
            value,
            result
        );








        //--------------------------------
        // Copy properties recursively
        //--------------------------------

        for(
            const key of
                Object.keys(value)
        )
        {

            result[key] =
                this.cloneSnapshot(

                    value[key],

                    seen

                );

        }








        return result;


    }









    //--------------------------------
    // Export save object
    //--------------------------------


    toJSON()
    {


        return {

            version:
                this.version,


            createdAt:
                this.createdAt,


            game:
                this.game,


            player:
                this.player,


            state:
                this.state

        };


    }



}





module.exports =
    SaveData;