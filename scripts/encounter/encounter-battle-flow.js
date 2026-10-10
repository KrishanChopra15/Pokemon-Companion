/**
 * Pokémon Companion
 * Encounter Battle Flow
 *
 * Connects wild encounters to battles.
 *
 * Responsibilities:
 * - Convert encounters into battles.
 * - Start wild battles.
 * - Provide battle initialization.
 *
 * Does NOT:
 * - Execute battle turns.
 * - Calculate damage.
 * - Capture Pokémon.
 * - Give rewards.
 */

"use strict";





class EncounterBattleFlow {



    constructor(
        encounterFlow,
        wildBattleService
    )
    {


        this.encounters =
            encounterFlow;


        this.wildBattle =
            wildBattleService;


    }









    //--------------------------------
    // Start wild battle
    //--------------------------------


    startBattle(
        player,
        playerPokemon
    )
    {


        const encounter =
            this.encounters
                .getCurrentEncounter();



        if(
            !encounter
        )
        {

            return {

                success:false,

                reason:
                    "No active encounter"

            };

        }








        if(
            !this.wildBattle
        )
        {

            return {

                success:false,

                reason:
                    "Wild battle service unavailable"

            };

        }








        const result =
            this.wildBattle
                .startBattle(
                
                    player,
                
                    playerPokemon,
                
                    encounter
                
                );
            
            
        if (
            !result ||
            result.success === false
        )
        {
            return {
            
                success: false,
            
                reason:
                    result?.reason ||
                    "Failed to start wild battle",
            
                encounter,
            
                battle:
                    result
            
            };
        }
        
        
        return {
        
            success: true,
        
            encounter,
        
            battle:
                result
        
        };


    }









    //--------------------------------
    // Check battle availability
    //--------------------------------


    canBattle()
    {

        return this.encounters
            .getCurrentEncounter()
            !==
            null;


    }









    //--------------------------------
    // Current encounter
    //--------------------------------


    getEncounter()
    {

        return this.encounters
            .getCurrentEncounter();

    }



}





module.exports =
    EncounterBattleFlow;