/**
 * Pokémon Companion
 * Battle Active Flow
 *
 * Coordinates active Pokémon during battle.
 *
 * Responsibilities:
 * - Send Pokémon into battle.
 * - Switch active Pokémon.
 * - Handle active status.
 *
 * Does NOT:
 * - Execute attacks.
 * - Calculate damage.
 */

"use strict";





class BattleActiveFlow {



    constructor(
        activeManager,
        teamFlow
    )
    {


        this.active =
            activeManager;


        this.team =
            teamFlow;


    }









    //--------------------------------
    // Send Pokémon
    //--------------------------------


    sendOut(
        pokemon
    )
    {


        return this.active
            .setActive(
                pokemon
            );


    }









    //--------------------------------
    // Switch Pokémon
    //--------------------------------


    switchPokemon(
        pokemon
    )
    {


        return this.active
            .setActive(
                pokemon
            );


    }









    //--------------------------------
    // Current Pokémon
    //--------------------------------


    getActive()
    {


        return this.active
            .getActive();


    }









    //--------------------------------
    // Battle status
    //--------------------------------


    getStatus()
    {


        return this.active
            .getStatus();


    }



}





module.exports =
    BattleActiveFlow;