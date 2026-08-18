/**
 * Pokémon Companion
 * Save Manager
 *
 * Handles save creation and loading.
 *
 * Responsibilities:
 * - Create save data.
 * - Store saves in memory.
 * - Restore session state.
 *
 * Does NOT:
 * - Handle filesystem.
 * - Handle cloud saves.
 * - Modify game rules.
 */

"use strict";


const SaveData =
    require("./save-data");





class SaveManager {



    constructor()
    {


        this.saves =
            [];


        this.nextId =
            1;


    }









    //--------------------------------
    // Create save
    //--------------------------------


    createSave(
        session
    )
    {


        const save =
            new SaveData(
                session
            );



        const record =
        {

            id:

                this.nextId++,


            data:

                save.toJSON()


        };



        this.saves.push(

            record

        );



        return {

            success:true,

            saveId:
                record.id,

            data:
                record.data

        };


    }









    //--------------------------------
    // Load save
    //--------------------------------


    loadSave(
        id,
        session
    )
    {


        const record =
            this.saves.find(

                save =>

                    save.id === id

            );



        if(
            !record
        )
        {

            return {

                success:false,

                reason:
                    "Save not found"

            };

        }








        session.game =
            record.data.game;



        session.player =
            record.data.player;



        session.state =
            record.data.state;



        return {

            success:true,

            session

        };


    }









    //--------------------------------
    // List saves
    //--------------------------------


    getSaves()
    {

        return this.saves;

    }



}





module.exports =
    SaveManager;