/**
 * Pokémon Companion
 * Backend Battle Service
 *
 * Connects API layer with battle runtime.
 *
 * Responsibilities:
 * - Create battles.
 * - Load battles.
 * - Process turns.
 * - Return battle state.
 *
 * Does NOT:
 * - Store a second battle state.
 * - Calculate damage.
 * - Handle moves.
 * - Handle EXP.
 * - Handle evolution.
 */

"use strict";


//--------------------------------
// Import runtime services
//--------------------------------

const AppContainer =
    require("../../scripts/app-container");


//--------------------------------
// Backend Battle Service
//--------------------------------

class BattleService {


    constructor()
    {

        this.app =
            new AppContainer();


        //--------------------------------
        // Runtime battle service
        //--------------------------------

        this.battleRuntime =
            this.app.get(
                "battle"
            );


        //--------------------------------
        // Runtime battle engine
        //--------------------------------

        this.engine =
            this.app.get(
                "battleEngine"
            );

    }


    //--------------------------------
    // Create battle
    //--------------------------------

    async createBattle(
        trainerId,
        opponent,
        player
    )
    {


        if(
            !trainerId
        )
        {

            return {

                success:false,

                reason:
                    "Trainer missing"

            };

        }


        if(
            !player
            ||
            !Array.isArray(
                player.party
            )
            ||
            player.party.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Player has no Pokémon"

            };

        }


        //--------------------------------
        // Runtime battle creation
        //--------------------------------

        const result =

            this.battleRuntime.startTrainerBattle(

                trainerId,

                player

            );


        return result;

    }


    //--------------------------------
    // Get battle
    //--------------------------------

    async getBattle(
        battleId
    )
    {

        if(
            !battleId
        )
        {

            return null;

        }


        return this.battleRuntime.getBattle(

            battleId

        );

    }


    //--------------------------------
    // Process turn
    //--------------------------------

    async processTurn(
        battleId,
        move
    )
    {


        if(
            !battleId
            ||
            !move
        )
        {

            return {

                success:false,

                reason:
                    "Missing turn data"

            };

        }


        //--------------------------------
        // Resolve authoritative battle
        //--------------------------------

        const battle =

            this.battleRuntime.getBattle(

                battleId

            );


        if(
            !battle
        )
        {

            return {

                success:false,

                reason:
                    "Battle not found"

            };

        }


        //--------------------------------
        // Check active battle
        //--------------------------------

        if(
            !this.battleRuntime.isActive(

                battleId

            )
        )
        {

            return {

                success:false,

                reason:
                    "Battle is not active"

            };

        }


        //--------------------------------
        // Process against same battle object
        //--------------------------------

        if(
            !this.engine
        )
        {

            return {

                success:false,

                reason:
                    "Battle engine unavailable"

            };

        }


        return this.engine.processTurn(

            battle,

            move

        );

    }


    //--------------------------------
    // Battle state
    //--------------------------------

    async getState(
        battleId
    )
    {


        if(
            !battleId
        )
        {

            return null;

        }


        //--------------------------------
        // BattleService owns state
        //--------------------------------

        return this.battleRuntime.getState(

            battleId

        );

    }


    //--------------------------------
    // Check active
    //--------------------------------

    async isActive(
        battleId
    )
    {


        if(
            !battleId
        )
        {

            return false;

        }


        return this.battleRuntime.isActive(

            battleId

        );

    }


}


module.exports =
    new BattleService();