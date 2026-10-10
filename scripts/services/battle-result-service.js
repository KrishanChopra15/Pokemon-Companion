/**
 * Pokémon Companion
 * Battle Result Service
 *
 * Determines battle outcome.
 *
 * Responsibilities:
 * - Check remaining Pokémon.
 * - Determine winner.
 * - Complete battles.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Handle fainting.
 * - Manage turns.
 */

"use strict";





class BattleResultService {





    //--------------------------------
    // Check battle end
    //--------------------------------


    checkBattleEnd(
        battle
    )
    {


        if(
            !battle
            ||
            !battle.player
            ||
            !battle.opponent
        )
        {

            return null;

        }









        const playerAlive =

            battle.player.party.some(

                pokemon =>

                    pokemon.hp > 0

            );





        const opponentAlive =

            battle.opponent.party.some(

                pokemon =>

                    pokemon.hp > 0

            );









        //--------------------------------
        // Opponent defeated
        //--------------------------------


        if(
            !opponentAlive
        )
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "PLAYER";


        }









        //--------------------------------
        // Player defeated
        //--------------------------------


        else if(
            !playerAlive
        )
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "OPPONENT";

        }









        return {

            status:
                battle.status,


            winner:
                battle.winner

        };


    }









    //--------------------------------
    // Check completed
    //--------------------------------


    isFinished(
        battle
    )
    {


        return !!(

            battle
            &&
            battle.status ===
            "COMPLETED"

        );


    }





}





module.exports =
    BattleResultService;