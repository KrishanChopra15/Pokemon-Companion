/**
 * Pokémon Companion
 * Battle Engine Service
 *
 * Coordinates battle operations.
 *
 * Responsibilities:
 * - Validate battle data.
 * - Initialize battle metadata.
 * - Forward turns to battle flow.
 * - Resolve active Pokémon.
 *
 * Does NOT:
 * - Store battles.
 * - Create duplicate battle state.
 * - Store Pokémon separately.
 * - Manage active Pokémon separately.
 * - Calculate damage.
 * - Execute moves.
 * - Handle battle AI.
 * - Handle fainting.
 * - Handle switching.
 * - Handle battle results.
 */

"use strict";


class BattleEngineService {


    constructor(
        battleFlowService,
        battlePokemonService
    )
    {

        this.flow =
            battleFlowService;


        this.pokemon =
            battlePokemonService;

    }


    //--------------------------------
    // Initialize battle
    //--------------------------------

    initializeBattle(
        battle
    )
    {

        if(
            !battle
            ||
            !battle.id
            ||
            !battle.player
            ||
            !battle.opponent
            ||
            !Array.isArray(
                battle.player.party
            )
            ||
            !Array.isArray(
                battle.opponent.party
            )
        )
        {

            return {

                success:false,

                reason:
                    "Invalid battle data"

            };

        }


        //--------------------------------
        // Initialize metadata
        //--------------------------------

        battle.status ??=
            "ACTIVE";


        battle.turn ??=
            1;


        battle.result ??=
            null;


        //--------------------------------
        // Initialize active indexes
        //--------------------------------

        battle.player.active ??=
            0;


        battle.opponent.active ??=
            0;


        //--------------------------------
        // Validate player active index
        //--------------------------------

        if(
            battle.player.active < 0
            ||
            battle.player.active >=
                battle.player.party.length
        )
        {

            battle.player.active =
                0;

        }


        //--------------------------------
        // Validate opponent active index
        //--------------------------------

        if(
            battle.opponent.active < 0
            ||
            battle.opponent.active >=
                battle.opponent.party.length
        )
        {

            battle.opponent.active =
                0;

        }


        return {

            success:true,

            battle

        };

    }


    //--------------------------------
    // Process turn
    //--------------------------------

    processTurn(
        battle,
        playerMove
    )
    {

        if(
            !battle
        )
        {

            return {

                success:false,

                reason:
                    "Unknown battle"

            };

        }


        if(
            battle.status !==
            "ACTIVE"
        )
        {

            return {

                success:false,

                reason:
                    "Battle is not active"

            };

        }


        if(
            !this.flow
        )
        {

            return {

                success:false,

                reason:
                    "Battle flow unavailable"

            };

        }


        return this.flow.processTurn(

            battle,

            playerMove

        );

    }


    //--------------------------------
    // Get active player Pokémon
    //--------------------------------

    getPlayerActive(
        battle
    )
    {

        if(
            !battle
            ||
            !battle.player
            ||
            !this.pokemon
        )
        {

            return null;

        }


        return this.pokemon.getActivePokemon(

            battle.player

        );

    }


    //--------------------------------
    // Get active opponent Pokémon
    //--------------------------------

    getOpponentActive(
        battle
    )
    {

        if(
            !battle
            ||
            !battle.opponent
            ||
            !this.pokemon
        )
        {

            return null;

        }


        return this.pokemon.getActivePokemon(

            battle.opponent

        );

    }


}


module.exports =
    BattleEngineService;