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



        this.player =
            session.getPlayer();



        this.state =
            session.getState();


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