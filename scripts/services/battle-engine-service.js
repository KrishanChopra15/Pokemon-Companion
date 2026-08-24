/**
 * Pokémon Companion
 * Battle Engine Service
 *
 * Main battle coordinator.
 *
 * Responsibilities:
 * - Initialize battles.
 * - Forward turns.
 * - Provide battle access.
 *
 * Does NOT:
 * - Store battle logic.
 * - Validate moves.
 * - Calculate damage.
 * - Execute moves.
 * - Handle fainting.
 * - Handle switching.
 * - Handle battle results.
 */

"use strict";





class BattleEngineService {



    constructor(
        battleStateService,
        battleFlowService,
        battlePokemonService
    )
    {


        this.state =
            battleStateService;


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
        )
        {

            return {

                success:false,

                reason:
                    "Invalid battle data"

            };

        }








        const state =
        {

            id:
                battle.id,


            status:
                "ACTIVE",


            player:
            {

                party:
                    battle.player.party || [],


                active:
                    0

            },


            opponent:
            {

                party:
                    battle.opponent.party || [],


                active:
                    0

            },


            turn:
                1,


            winner:
                null

        };









        if(
            this.state
        )
        {

            this.state.initialize(

                state

            );

        }









        return state;


    }









    //--------------------------------
    // Get battle
    //--------------------------------


    getBattle(
        battleId
    )
    {


        if(
            !this.state
        )
        {

            return null;

        }





        return this.state.getBattle(

            battleId

        );


    }









    //--------------------------------
    // Process turn
    //--------------------------------


    processTurn(
        battleId,
        playerMove
    )
    {


        const battle =

            this.getBattle(

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
    // Active player Pokémon
    //--------------------------------


    getPlayerActive(
        battleId
    )
    {


        const battle =

            this.getBattle(

                battleId

            );





        if(
            !battle
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
    // Active opponent Pokémon
    //--------------------------------


    getOpponentActive(
        battleId
    )
    {


        const battle =

            this.getBattle(

                battleId

            );





        if(
            !battle
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