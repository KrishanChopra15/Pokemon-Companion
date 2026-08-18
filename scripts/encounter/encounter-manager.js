/**
 * Pokémon Companion
 * Encounter Manager
 *
 * Handles active encounter state.
 *
 * Responsibilities:
 * - Store current encounter.
 * - Track encounter history.
 * - Provide encounter state access.
 * - Reset encounters.
 *
 * Does NOT:
 * - Generate wild Pokémon.
 * - Handle battles.
 * - Handle capture.
 * - Modify trainer state.
 */

"use strict";





class EncounterManager {



    constructor()
    {


        this.currentEncounter =
            null;



        this.history =
            [];


    }









    //--------------------------------
    // Start encounter
    //--------------------------------


    setEncounter(
        encounter
    )
    {


        if(
            !encounter
        )
        {

            return {

                success:false,

                reason:
                    "Invalid encounter"

            };

        }








        this.currentEncounter =
            encounter;



        this.history.push(

            encounter

        );








        return {

            success:true,

            encounter

        };


    }









    //--------------------------------
    // Get active encounter
    //--------------------------------


    getEncounter()
    {

        return this.currentEncounter;

    }









    //--------------------------------
    // Check active encounter
    //--------------------------------


    hasEncounter()
    {

        return Boolean(

            this.currentEncounter

        );


    }









    //--------------------------------
    // Clear encounter
    //--------------------------------


    clearEncounter()
    {


        this.currentEncounter =
            null;



        return {

            success:true

        };


    }









    //--------------------------------
    // History
    //--------------------------------


    getHistory()
    {

        return this.history;

    }









    //--------------------------------
    // Last encounter
    //--------------------------------


    getLastEncounter()
    {


        if(
            this.history.length === 0
        )
        {

            return null;

        }



        return this.history[
            this.history.length - 1
        ];


    }









    //--------------------------------
    // Reset
    //--------------------------------


    reset()
    {


        this.currentEncounter =
            null;



        this.history =
            [];



        return {

            success:true

        };


    }



}





module.exports =
    EncounterManager;