/**
 * Pokémon Companion
 * Pokémon Move Slot Domain
 *
 * Represents one move currently known by a Pokémon.
 *
 * Responsibilities:
 * - Store move reference.
 * - Track PP.
 *
 * Does NOT:
 * - Store move power.
 * - Store accuracy.
 * - Execute moves.
 * - Read databases.
 */

"use strict";


class PokemonMoveSlot {



    /**
     * Create a Pokémon move slot.
     *
     * @param {Object} data
     */
    constructor(data = {})
    {


        /**
         * Move constant.
         *
         * Example:
         * MOVE_EMBER
         */
        this.constant =
            data.constant || null;



        /**
         * Current remaining PP.
         */
        this.currentPP =
            data.currentPP || 0;



        /**
         * Maximum PP.
         */
        this.maxPP =
            data.maxPP || 0;


    }









    //--------------------------------
    // Use PP
    //--------------------------------


    usePP()
    {


        if(
            this.currentPP <= 0
        )
        {

            return false;

        }



        this.currentPP--;


        return true;


    }









    //--------------------------------
    // Restore PP
    //--------------------------------


    restorePP()
    {


        this.currentPP =
            this.maxPP;


        return this.currentPP;


    }









    //--------------------------------
    // Check empty
    //--------------------------------


    isEmpty()
    {

        return (

            this.currentPP <= 0

        );

    }



}


module.exports =
    PokemonMoveSlot;