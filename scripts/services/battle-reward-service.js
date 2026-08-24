/**
 * Pokémon Companion
 * Battle Reward Service
 *
 * Handles rewards after battle completion.
 *
 * Responsibilities:
 * - Calculate EXP rewards.
 * - Give EXP to Pokémon.
 * - Check level progress.
 * - Trigger evolution checks.
 * - Apply trainer rewards.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Manage turns.
 * - Handle battle state.
 */

"use strict";





class BattleRewardService {



    constructor(
        experienceService,
        evolutionService,
        rewardService
    )
    {

        this.experience =
            experienceService;


        this.evolution =
            evolutionService;


        this.rewards =
            rewardService;


    }









    //--------------------------------
    // Give battle EXP
    //--------------------------------


    giveBattleExp(
        pokemon,
        defeatedPokemon,
        source = "TRAINER"
    )
    {


        if(
            !pokemon
            ||
            !defeatedPokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }








        const expAmount =

            this.experience.calculateExp(

                defeatedPokemon,

                source

            );








        const result =

            this.experience.giveExp(

                pokemon,

                expAmount

            );








        return {


            success:

                result.success,


            exp:

                expAmount,


            result


        };


    }









    //--------------------------------
    // Check evolution
    //--------------------------------


    checkEvolution(
        pokemon,
        context = {}
    )
    {


        if(
            !this.evolution
        )
        {

            return {

                success:false,

                reason:
                    "Evolution service unavailable"

            };

        }








        return this.evolution.checkEvolution(

            pokemon,

            context

        );


    }









    //--------------------------------
    // Process full battle reward
    //--------------------------------
    
    
    processBattleRewards(
        pokemon,
        defeatedPokemon,
        trainerRewards,
        trainerState,
        source = "TRAINER"
    )
    {
    
    
        //--------------------------------
        // Store original species
        //--------------------------------
    
    
        const oldSpecies =
            pokemon.species;
    
    
    
    
    
        //--------------------------------
        // EXP
        //--------------------------------
    
    
        const expResult =
    
            this.giveBattleExp(
            
                pokemon,
            
                defeatedPokemon,
            
                source
            
            );
        
        
        
        
        
        
        
        
        
        //--------------------------------
        // Evolution
        //--------------------------------
        
        
        let evolutionResult = null;
        
        
        
        
        
        if(
            expResult.success
        )
        {
        
        
            evolutionResult =
        
                this.checkEvolution(
                
                    pokemon
                
                );
            
            
        }
    
    
    
    
    
    
    
    
    
        //--------------------------------
        // Trainer rewards
        //--------------------------------
    
    
        let rewardResult = null;
    
    
    
    
    
        if(
            this.rewards
            &&
            trainerRewards
            &&
            trainerState
        )
        {
        
        
            rewardResult =
        
                this.rewards.execute(
                
                    trainerRewards,
                
                    trainerState
                
                );
            
            
        }
    
    
    
    
    
    
    
    
    
        return {
        
        
            success:true,
        
        
            pokemonBeforeEvolution:
        
                oldSpecies,
        
        
        
            pokemon:
        
                pokemon.species,
        
        
        
            levelUps:
        
                expResult.result.levels,
        
        
        
            exp:
        
                expResult,
        
        
        
            evolution:
        
                evolutionResult,
        
        
        
            rewards:
        
                rewardResult
        
        
        };
    
    
    }


}





module.exports =
    BattleRewardService;