/**
 * Pokémon Companion
 * Battle State Service
 *
 * Provides access to battle state.
 *
 * Responsibilities:
 * - Retrieve battle instances.
 * - Remove battle instances.
 * - List battle instances.
 * - Check whether a battle exists.
 *
 * Does NOT:
 * - Create duplicate battle state.
 * - Store player/enemy copies.
 * - Execute moves.
 * - Calculate damage.
 * - Manage turns.
 * - Determine battle results.
 */

"use strict";


class BattleStateService {


    constructor(
        battleService = null
    )
    {

        this.battles =
            battleService;

    }


    //--------------------------------
    // Get battle
    //--------------------------------

    getBattle(
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
    // Get all battles
    //--------------------------------

    getBattles()
    {

        if(
            !this.battles
        )
        {

            return [];

        }


        return this.battles.getActiveBattles
            ? this.battles.getActiveBattles()
            : [];

    }


    //--------------------------------
    // Remove battle
    //--------------------------------

    removeBattle(
        battleId
    )
    {

        if(
            !this.battles
        )
        {

            return false;

        }


        return this.battles.clearBattle(
            battleId
        );

    }


    //--------------------------------
    // Check battle exists
    //--------------------------------

    exists(
        battleId
    )
    {

        return !!this.getBattle(
            battleId
        );

    }


}


module.exports =
    BattleStateService;