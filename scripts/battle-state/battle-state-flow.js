/**
 * Pokémon Companion
 * Battle State Flow
 *
 * Provides access to the current battle state.
 *
 * Responsibilities:
 * - Retrieve battle state.
 * - Check battle status.
 *
 * Does NOT:
 * - Create duplicate battle state.
 * - Store Pokémon separately.
 * - Track a separate turn counter.
 * - Store a separate battle history.
 * - Execute moves.
 * - Calculate damage.
 */

"use strict";


class BattleStateFlow {


    constructor(
        battleStateService
    )
    {

        this.battles =
            battleStateService;

    }


    //--------------------------------
    // Get battle state
    //--------------------------------

    getBattleState(
        battleId
    )
    {

        if(
            !this.battles
        )
        {

            return null;

        }


        return this.battles.getBattle(

            battleId

        );

    }


    //--------------------------------
    // Check active
    //--------------------------------

    isActive(
        battleId
    )
    {

        const battle =
            this.getBattleState(

                battleId

            );


        return !!(

            battle &&

            battle.status ===
                "ACTIVE"

        );

    }


    //--------------------------------
    // Check finished
    //--------------------------------

    isFinished(
        battleId
    )
    {

        const battle =
            this.getBattleState(

                battleId

            );


        return !!(

            battle &&

            battle.status ===
                "COMPLETED"

        );

    }


}


module.exports =
    BattleStateFlow;