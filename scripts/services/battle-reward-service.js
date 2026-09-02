/**
 * Pokémon Companion
 * Battle Reward Service
 *
 * Handles rewards after battle completion.
 *
 * Responsibilities:
 * - Calculate EXP rewards.
 * - Give EXP to Pokémon.
 * - Apply level increases.
 * - Apply friendship from level ups.
 * - Apply major battle friendship.
 * - Check level-up evolution.
 * - Synchronize progression state.
 * - Apply trainer rewards.
 *
 * Does NOT:
 * - Store battle state.
 * - Store Pokémon copies.
 * - Execute moves.
 * - Calculate damage.
 * - Manage turns.
 * - Determine whether a trainer is a major battle.
 */

"use strict";


class BattleRewardService
{


    constructor(
        experienceService,
        levelUpService,
        evolutionService,
        friendshipService,
        rewardService
    )
    {

        this.experience =
            experienceService;


        this.levelUp =
            levelUpService;


        this.evolution =
            evolutionService;


        this.friendship =
            friendshipService;


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

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        //--------------------------------
        // Calculate EXP
        //--------------------------------

        const expAmount =
            this.experience.calculateExp(

                defeatedPokemon,

                source

            );


        //--------------------------------
        // Give EXP
        //--------------------------------

        const result =
            this.experience.giveExp(

                pokemon,

                expAmount

            );


        if(
            !result.success
        )
        {

            return {

                success:
                    false,

                reason:
                    "Failed to give EXP",

                exp:
                    result

            };

        }


        //--------------------------------
        // Apply actual level increases
        //--------------------------------

        let levelUpResult =
            null;


        let friendshipResults =
            [];


        if(
            Array.isArray(
                result.levels
            )
            &&
            result.levels.length > 0
        )
        {

            if(
                !this.levelUp
                ||
                typeof this.levelUp.levelUp !==
                    "function"
            )
            {

                return {

                    success:
                        false,

                    reason:
                        "Level up service unavailable",

                    exp:
                        result

                };

            }


            levelUpResult =
                this.levelUp.levelUp(

                    pokemon,

                    result.levels.length

                );


            if(
                !levelUpResult.success
            )
            {

                return {

                    success:
                        false,

                    reason:
                        "Failed to apply level up",

                    exp:
                        result,

                    levelUp:
                        levelUpResult

                };

            }


            //--------------------------------
            // Level-up friendship
            //--------------------------------

            if(
                this.friendship
                &&
                typeof this.friendship.applyLevelUp ===
                    "function"
            )
            {

                for(
                    const level of
                        result.levels
                )
                {

                    const friendshipResult =
                        this.friendship.applyLevelUp(

                            pokemon

                        );


                    friendshipResults.push(

                        {

                            level,

                            ...friendshipResult

                        }

                    );

                }

            }

        }


        return {

            success:
                true,

            exp:
                expAmount,

            result,

            levelUp:
                levelUpResult,

            friendship:
                friendshipResults

        };

    }


    //--------------------------------
    // Synchronize progression state
    // back to the authoritative
    // Pokémon object.
    //--------------------------------

    syncProgressionState(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        //--------------------------------
        // Runtime Pokémon may not have a
        // source object when this service
        // is used directly in tests.
        //--------------------------------

        if(
            !pokemon.sourcePokemon
        )
        {

            return {

                success:
                    true,

                synchronized:
                    false,

                reason:
                    "Source Pokemon unavailable",

                pokemon

            };

        }


        const source =
            pokemon.sourcePokemon;


        //--------------------------------
        // Persistent progression
        //--------------------------------

        source.species =
            pokemon.species;


        source.level =
            pokemon.level;


        source.exp =
            pokemon.exp;


        source.friendship =
            pokemon.friendship;


        //--------------------------------
        // Evolution history
        //--------------------------------

        if(
            pokemon.evolutionHistory
        )
        {

            source.evolutionHistory =
                pokemon.evolutionHistory;

        }


        //--------------------------------
        // Nickname
        //--------------------------------

        if(
            pokemon.nickname !==
                undefined
        )
        {

            source.nickname =
                pokemon.nickname;

        }


        //--------------------------------
        // Preserve individual move state
        // when battle rewards modified it.
        //--------------------------------

        if(
            Array.isArray(
                pokemon.moves
            )
        )
        {

            source.moves =
                pokemon.moves;

        }


        return {

            success:
                true,

            synchronized:
                true,

            pokemon:
                source

        };

    }


    //--------------------------------
    // Apply major battle friendship
    //--------------------------------

    applyMajorBattleFriendship(
        pokemon,
        options = {}
    )
    {

        if(
            !pokemon
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        if(
            !this.friendship
        )
        {

            return {

                success:
                    false,

                reason:
                    "Friendship service unavailable"

            };

        }


        if(
            typeof this.friendship.applyMajorBattle !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Major battle friendship is unavailable"

            };

        }


        return this.friendship.applyMajorBattle(

            pokemon,

            options

        );

    }


    //--------------------------------
    // Apply major battle friendship
    // to party
    //--------------------------------

    applyMajorBattlePartyFriendship(
        party,
        options = {}
    )
    {

        if(
            !Array.isArray(
                party
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid party",

                results:
                    []

            };

        }


        const results =
            [];


        for(
            const pokemon of party
        )
        {

            if(
                !pokemon
            )
            {

                continue;

            }


            const result =
                this.applyMajorBattleFriendship(

                    pokemon,

                    options

                );


            results.push(

                {

                    pokemon:
                        pokemon.species,

                    ...result

                }

            );

        }


        return {

            success:
                true,

            results

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

                success:
                    false,

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
        source = "TRAINER",
        context = {}
    )
    {

        if(
            !pokemon
            ||
            !defeatedPokemon
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        //--------------------------------
        // EXP and level up
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

                success:
                    false,

                reason:
                    "Failed to process battle EXP",

                exp:
                    expResult

            };

        }


        //--------------------------------
        // Major battle friendship
        //--------------------------------

        let majorBattleFriendship =
            null;


        if(
            context.majorBattle ===
                true
        )
        {

            const party =
                Array.isArray(
                    context.playerParty
                )

                ?

                context.playerParty

                :

                [pokemon];


            majorBattleFriendship =
                this.applyMajorBattlePartyFriendship(

                    party,

                    context

                );

        }


        //--------------------------------
        // Evolution
        //--------------------------------

        let evolutionResult =
        {

            success:
                false,

            reason:
                "No level-up"

        };


        if(
            expResult.levelUp
            &&
            Array.isArray(
                expResult.levelUp.levels
            )
            &&
            expResult.levelUp.levels.length > 0
        )
        {

            evolutionResult =
                this.checkEvolution(

                    pokemon,

                    {

                        ...context,

                        levelUp:
                            true,

                        trigger:
                            "LEVEL_UP",

                        evolutionTrigger:
                            "LEVEL_UP"

                    }

                );

        }


        //--------------------------------
        // Synchronize the Pokémon that
        // received EXP/evolution.
        //--------------------------------

        const synchronization =
            this.syncProgressionState(

                pokemon

            );


        //--------------------------------
        // Synchronize party Pokémon that
        // received major-battle friendship.
        //--------------------------------

        const partySynchronization =
            [];


        if(
            context.majorBattle ===
                true
            &&
            Array.isArray(
                context.playerParty
            )
        )
        {

            for(
                const partyPokemon of
                    context.playerParty
            )
            {

                const result =
                    this.syncProgressionState(

                        partyPokemon

                    );


                partySynchronization.push(

                    {

                        pokemon:
                            partyPokemon?.species
                            ||
                            null,

                        ...result

                    }

                );

            }

        }


        //--------------------------------
        // Trainer rewards
        //--------------------------------

        let rewardResult =
            null;


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


        //--------------------------------
        // Result
        //--------------------------------

        return {

            success:
                true,

            pokemon,

            exp:
                expResult,

            evolution:
                evolutionResult,

            majorBattleFriendship,

            synchronization,

            partySynchronization,

            rewards:
                rewardResult

        };

    }


}


module.exports =
    BattleRewardService;