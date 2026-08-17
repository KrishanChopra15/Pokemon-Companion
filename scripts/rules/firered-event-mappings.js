/**
 * Pokémon Companion
 * FireRed Event Mappings
 *
 * Maps companion-level story events
 * to actual FireRed ROM event scripts.
 *
 * Responsibilities:
 * - Connect story objectives to ROM events.
 * - Provide completion flags.
 * - Provide mapped progression rewards.
 *
 * Does NOT:
 * - Extract ROM data.
 * - Execute events.
 * - Handle event logic.
 */

"use strict";


const mappings = {


    //--------------------------------
    // Oak Parcel
    //--------------------------------
    //
    // Story:
    // Deliver Oak's Parcel
    //
    // ROM:
    // Viridian City Mart NPC
    //--------------------------------


    GET_OAK_PARCEL: {


        eventId:

            "ViridianCity_Mart_EventScript_ParcelScene",



        completionFlag:

            "OAK_PARCEL_DELIVERED",



        rewards:
        {

            addKeyItems:

            [
                "OAKS_PARCEL"
            ]


        }


    },








    //--------------------------------
    // Receive Pokédex
    //--------------------------------
    //
    // Story:
    // Receive Pokédex from Professor Oak
    //
    // ROM:
    // Oak's Lab
    //--------------------------------


    RECEIVE_POKEDEX:
    {


        eventId:

            "PalletTown_ProfessorOaksLab_EventScript_Pokedex",



        completionFlag:

            "POKEDEX_RECEIVED",



        rewards:
        {

            addKeyItems:

            [
                "POKEDEX"
            ]


        }


    }







};





module.exports =
    mappings;