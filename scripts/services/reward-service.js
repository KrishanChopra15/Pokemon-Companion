/**
 * Pokémon Companion
 * Reward Service
 *
 * Applies event rewards to trainer state.
 *
 * Responsibilities:
 * - Apply item rewards.
 * - Apply Pokémon rewards.
 * - Initialize Pokémon friendship.
 * - Preserve Pokémon reward metadata.
 * - Apply money rewards.
 * - Apply story flag rewards.
 * - Remove story flags.
 * - Record completed battles.
 *
 * Does NOT:
 * - Manage inventory directly.
 * - Execute battles.
 * - Handle evolution.
 * - Load ROM data.
 * - Calculate capture probability.
 */

"use strict";


class RewardService
{


    constructor(
        pokemonDatabase = null
    )
    {

        this.pokemonDatabase =
            pokemonDatabase;

    }


    //--------------------------------
    // Execute rewards
    //--------------------------------

    execute(
        rewards,
        trainerState
    )
    {


        if(
            !rewards
        )
        {

            return {

                success:
                    false,

                reason:
                    "No rewards"

            };

        }


        if(
            !trainerState
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing trainer state"

            };

        }


        //--------------------------------
        // Items
        //--------------------------------

        for(
            const item of
                rewards.addItems || []
        )
        {

            if(
                !item
            )
            {

                continue;

            }


            trainerState.addItem(

                item.name,

                item.quantity || 1

            );

        }


        //--------------------------------
        // Pokémon
        //--------------------------------

        for(
            const rewardPokemon of
                rewards.addPokemon || []
        )
        {

            if(
                !rewardPokemon
                ||
                !rewardPokemon.species
            )
            {

                continue;

            }


            const pokemon =
                this.createRewardPokemon(
                    rewardPokemon
                );


            trainerState.addPokemon(
                pokemon
            );

        }


        //--------------------------------
        // Money
        //--------------------------------

        if(
            rewards.addMoney
        )
        {

            trainerState.addMoney(

                rewards.addMoney

            );

        }


        //--------------------------------
        // Story flags
        //--------------------------------

        for(
            const flag of
                rewards.addStoryFlags || []
        )
        {

            trainerState.addStoryFlag(

                flag

            );

        }


        //--------------------------------
        // HM abilities
        //--------------------------------

        for(
            const ability of
                rewards.hmAbilities || []
        )
        {

            if(
                !ability
            )
            {

                continue;

            }


            trainerState.addHMAbility(

                ability

            );

        }

        
        //--------------------------------
        // Remove flags
        //--------------------------------

        for(
            const flag of
                rewards.removeStoryFlags || []
        )
        {

            trainerState.removeStoryFlag(

                flag

            );

        }


        //--------------------------------
        // Battles
        //--------------------------------

        for(
            const battle of
                rewards.battles || []
        )
        {

            trainerState.completeBattle(

                battle

            );

        }


        //--------------------------------
        // Return state
        //--------------------------------

        return {

            success:
                true,

            state:

                trainerState.getState

                ?

                trainerState.getState()

                :

                trainerState.serialize

                ?

                trainerState.serialize()

                :

                trainerState

        };

    }


    //--------------------------------
    // Create reward Pokémon
    //--------------------------------

    createRewardPokemon(
        rewardPokemon
    )
    {

        //--------------------------------
        // Resolve base friendship
        //--------------------------------

        const baseFriendship =
            this.getBaseFriendship(

                rewardPokemon.species

            );


        //--------------------------------
        // Build reward Pokémon
        //--------------------------------

        const pokemon =
        {

            species:
                rewardPokemon.species,


            level:
                rewardPokemon.level
                ||
                1,


            friendship:

                rewardPokemon.friendship
                !==
                undefined

                ?

                rewardPokemon.friendship

                :

                baseFriendship,


            nickname:
                rewardPokemon.nickname
                ||
                null,


            exp:
                rewardPokemon.exp
                ||
                0,


            moves:

                Array.isArray(
                    rewardPokemon.moves
                )

                ?

                rewardPokemon.moves

                :

                [],


            ball:
                rewardPokemon.ball
                ||
                null,


            metLocation:
                rewardPokemon.metLocation
                ||
                rewardPokemon.location
                ||
                null,


            location:
                rewardPokemon.location
                ||
                null

        };


        return pokemon;

    }


    //--------------------------------
    // Get base friendship
    //--------------------------------

    getBaseFriendship(
        species
    )
    {

        if(
            this.pokemonDatabase
            &&
            typeof this.pokemonDatabase.getBaseFriendship ===
                "function"
        )
        {

            const friendship =
                this.pokemonDatabase.getBaseFriendship(
                    species
                );


            if(
                friendship !== null
                &&
                friendship !== undefined
            )
            {

                return friendship;

            }

        }


        //--------------------------------
        // Default Gen III friendship
        //--------------------------------

        return 70;

    }


}


module.exports =
    RewardService;