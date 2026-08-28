/**
 * Pokémon Companion
 * Battle Active Flow
 *
 * Coordinates active Pokémon during battle.
 *
 * Responsibilities:
 * - Get the active Pokémon.
 * - Request Pokémon switches.
 *
 * Does NOT:
 * - Store a separate active Pokémon.
 * - Create duplicate Pokémon data.
 * - Execute attacks.
 * - Calculate damage.
 */

"use strict";


class BattleActiveFlow {


    constructor(
        battleStateService,
        pokemonSwitchService
    )
    {

        this.battles =
            battleStateService;


        this.switches =
            pokemonSwitchService;

    }


    //--------------------------------
    // Get active Pokémon
    //--------------------------------

    getActive(
        battleId,
        side
    )
    {

        const battle =
            this.battles.getBattle(
                battleId
            );


        if(
            !battle ||
            !side
        )
        {

            return null;

        }


        const activeIndex =
            side === "PLAYER"

            ?
            battle.player.active

            :
            battle.opponent.active;


        const participant =
            side === "PLAYER"

            ?
            battle.player

            :
            battle.opponent;


        return (

            participant.party[
                activeIndex ?? 0
            ]

            ||

            null

        );

    }


    //--------------------------------
    // Switch Pokémon
    //--------------------------------

    switchPokemon(
        battleId,
        side,
        index
    )
    {

        const battle =
            this.battles.getBattle(
                battleId
            );


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


        const participant =
            side === "PLAYER"

            ?
            battle.player

            :
            battle.opponent;


        if(
            !participant
        )
        {

            return {

                success:false,

                reason:
                    "Invalid battle side"

            };

        }


        return this.switches.switchPokemon(
            participant,
            index
        );

    }


    //--------------------------------
    // Get active status
    //--------------------------------

    getStatus(
        battleId,
        side
    )
    {

        const pokemon =
            this.getActive(
                battleId,
                side
            );


        return {

            hasActive:
                !!pokemon,

            active:
                pokemon

        };

    }


}


module.exports =
    BattleActiveFlow;