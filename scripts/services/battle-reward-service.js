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
 * - Store battle state.
 * - Store Pokémon copies.
 * - Execute moves.
 * - Calculate damage.
 * - Manage turns.
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
            !pokemon ||
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

        if(
            !pokemon ||
            !defeatedPokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }


        //--------------------------------
        // EXP
        //--------------------------------

        const expResult =
            this.giveBattleExp(
                pokemon,
                defeatedPokemon,
                source
            );


        if(
            !expResult.success
        )
        {

            return {

                success:false,

                reason:
                    "Failed to give battle EXP",

                exp:
                    expResult

            };

        }


        //--------------------------------
        // Evolution
        //--------------------------------

        const evolutionResult =
            this.checkEvolution(
                pokemon
            );


        //--------------------------------
        // Trainer rewards
        //--------------------------------

        let rewardResult = null;


        if(
            this.rewards &&
            trainerRewards &&
            trainerState
        )
        {

            rewardResult =
                this.rewards.execute(
                    trainerRewards,
                    trainerState
                );

        }


        //--------------------------------
        // Result
        //--------------------------------

        return {

            success:true,

            pokemon,

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