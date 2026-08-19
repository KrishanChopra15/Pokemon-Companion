/**
 * Pokémon Companion
 * Battle State Manager
 *
 * Stores current battle state.
 *
 * Responsibilities:
 * - Store player Pokémon.
 * - Store enemy Pokémon.
 * - Track turns.
 * - Track battle status.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 */

"use strict";


class BattleStateManager {



    constructor()
    {

        this.state =
        {

            player:null,

            enemy:null,

            turn:0,

            status:"ACTIVE",

            history:[]

        };


    }





    //--------------------------------
    // Set Player
    //--------------------------------


    setPlayer(
        pokemon
    )
    {

        this.state.player =
            pokemon;


        return {

            success:true,

            pokemon

        };

    }





    //--------------------------------
    // Set Enemy
    //--------------------------------


    setEnemy(
        pokemon
    )
    {

        this.state.enemy =
            pokemon;


        return {

            success:true,

            pokemon

        };

    }





    //--------------------------------
    // Advance Turn
    //--------------------------------


    nextTurn()
    {

        this.state.turn++;


        return {

            success:true,

            turn:
                this.state.turn

        };

    }





    //--------------------------------
    // Status
    //--------------------------------


    setStatus(
        status
    )
    {

        this.state.status =
            status;


        return {

            success:true,

            status

        };

    }





    //--------------------------------
    // History
    //--------------------------------


    addHistory(
        action
    )
    {

        this.state.history.push(
            action
        );


        return {

            success:true

        };

    }





    //--------------------------------
    // Get State
    //--------------------------------


    getState()
    {

        return this.state;

    }





    //--------------------------------
    // Reset
    //--------------------------------


    clear()
    {

        this.state =
        {

            player:null,

            enemy:null,

            turn:0,

            status:"ACTIVE",

            history:[]

        };


        return {

            success:true

        };

    }



}





module.exports =
    BattleStateManager;