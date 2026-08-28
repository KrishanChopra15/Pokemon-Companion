/**
 * Pokémon Companion
 * Battle Opponent Flow
 *
 * Coordinates access to the active opponent during battle.
 *
 * Responsibilities:
 * - Get the active opponent Pokémon.
 * - Provide opponent status.
 *
 * Does NOT:
 * - Store Pokémon data.
 * - Create duplicate Pokémon data.
 * - Manage active indexes.
 * - Execute attacks.
 * - Handle AI.
 */

"use strict";





class BattleOpponentFlow {



    constructor(
        battleStateService,
        battlePokemonService
    )
    {


        this.battles =
            battleStateService;


        this.pokemon =
            battlePokemonService;


    }









    //--------------------------------
    // Get active opponent
    //--------------------------------


    getOpponent(
        battleId
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

            return null;

        }





        return this.pokemon.getActivePokemon(

            battle.opponent

        );


    }









    //--------------------------------
    // Opponent status
    //--------------------------------


    getStatus(
        battleId
    )
    {


        const opponent =
            this.getOpponent(
                battleId
            );





        return {

            hasOpponent:
                !!opponent,


            opponent

        };


    }



}





module.exports =
    BattleOpponentFlow;