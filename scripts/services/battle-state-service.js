/**
 * Pokémon Companion
 * Battle State Service
 *
 * Handles battle state storage and synchronization.
 *
 * Responsibilities:
 * - Store battle instances.
 * - Initialize battle state.
 * - Retrieve battles.
 * - Remove battles.
 * - Sync player/enemy active state.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Manage turns.
 * - Determine battle results.
 */

"use strict";





class BattleStateService {



    constructor(
        battleStateFlow = null,
        battleActiveFlow = null,
        battleOpponentFlow = null
    )
    {


        this.state =
            battleStateFlow;


        this.active =
            battleActiveFlow;


        this.opponent =
            battleOpponentFlow;





        //--------------------------------
        // Battle storage
        //--------------------------------


        this.battles =
        {};

    }









    //--------------------------------
    // Initialize battle state
    //--------------------------------


    initialize(
        battle
    )
    {


        //--------------------------------
        // Validate battle
        //--------------------------------


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
            ||
            battle.player.party.length === 0
            ||
            battle.opponent.party.length === 0
        )
        {

            return false;

        }









        //--------------------------------
        // Store battle
        //--------------------------------


        this.battles[

            battle.id

        ] =
            battle;









        //--------------------------------
        // Get active Pokémon
        //--------------------------------


        const player =

            battle.player.party[0];


        const enemy =

            battle.opponent.party[0];









        //--------------------------------
        // Sync state flow
        //--------------------------------


        if(
            this.state
        )
        {

            this.state.setPlayer(

                player

            );


            this.state.setEnemy(

                enemy

            );

        }









        //--------------------------------
        // Send out player Pokémon
        //--------------------------------


        if(
            this.active
        )
        {

            this.active.sendOut(

                player

            );

        }









        //--------------------------------
        // Send out opponent Pokémon
        //--------------------------------


        if(
            this.opponent
        )
        {

            this.opponent.sendOut(

                enemy

            );

        }









        return true;


    }









    //--------------------------------
    // Get battle
    //--------------------------------


    getBattle(
        battleId
    )
    {


        return (

            this.battles[battleId]

            ||

            null

        );


    }









    //--------------------------------
    // Remove battle
    //--------------------------------


    removeBattle(
        battleId
    )
    {


        if(
            this.battles[battleId]
        )
        {

            delete this.battles[battleId];


            return true;

        }





        return false;


    }









    //--------------------------------
    // List battles
    //--------------------------------


    getBattles()
    {


        return Object.values(

            this.battles

        );


    }









    //--------------------------------
    // Clear battles
    //--------------------------------


    clear()
    {


        this.battles =
        {};


    }


}





module.exports =
    BattleStateService;