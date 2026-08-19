/**
 * Pokémon Companion
 * Battle Opponent Flow
 *
 * Coordinates enemy Pokémon during battle.
 *
 * Responsibilities:
 * - Send enemy Pokémon.
 * - Track opponent status.
 *
 * Does NOT:
 * - Execute attacks.
 * - Handle AI.
 */

"use strict";





class BattleOpponentFlow {



    constructor(
        opponentManager
    )
    {


        this.opponent =
            opponentManager;


    }









    //--------------------------------
    // Send opponent
    //--------------------------------


    sendOut(
        pokemon
    )
    {


        return this.opponent
            .setOpponent(
                pokemon
            );


    }









    //--------------------------------
    // Current opponent
    //--------------------------------


    getOpponent()
    {


        return this.opponent
            .getOpponent();


    }









    //--------------------------------
    // Status
    //--------------------------------


    getStatus()
    {


        return this.opponent
            .getStatus();


    }



}





module.exports =
    BattleOpponentFlow;