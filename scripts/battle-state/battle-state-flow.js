/**
 * Pokémon Companion
 * Battle State Flow
 *
 * Coordinates battle state.
 */

"use strict";


class BattleStateFlow {



    constructor(
        stateManager
    )
    {

        this.state =
            stateManager;

    }





    setPlayer(
        pokemon
    )
    {

        return this.state
            .setPlayer(
                pokemon
            );

    }





    setEnemy(
        pokemon
    )
    {

        return this.state
            .setEnemy(
                pokemon
            );

    }





    startTurn()
    {

        return this.state
            .nextTurn();

    }





    updateStatus(
        status
    )
    {

        return this.state
            .setStatus(
                status
            );

    }





    record(
        action
    )
    {

        return this.state
            .addHistory(
                action
            );

    }





    getBattleState()
    {

        return this.state
            .getState();

    }





    reset()
    {

        return this.state
            .clear();

    }



}





module.exports =
    BattleStateFlow;