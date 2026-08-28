/**
 * Pokémon Companion
 * Battle Service
 *
 * Controls battle lifecycle.
 *
 * Responsibilities:
 * - Start trainer battles.
 * - Start wild battles.
 * - Store active battle state.
 * - Resolve battle participants.
 * - Track battle results.
 * - Complete battles.
 * - Initialize battle engine state.
 * - Process battle rewards.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Handle battle AI.
 * - Manage turn order.
 * - Calculate EXP directly.
 * - Handle evolution directly.
 */

"use strict";


class BattleService {


    constructor(
        battlePreparationService,
        battleEngineService,
        battleRewardService
    )
    {


        this.preparation =
            battlePreparationService;


        this.engine =
            battleEngineService;


        this.rewards =
            battleRewardService;


        //--------------------------------
        // Active battle storage
        //--------------------------------

        this.activeBattles =
        {};


        this.nextBattleId =
            1;


    }


    //--------------------------------
    // Generate battle ID
    //--------------------------------

    createBattleId()
    {


        return `BATTLE_${this.nextBattleId++}`;


    }


    //--------------------------------
    // Start trainer battle
    //--------------------------------

    startTrainerBattle(
        trainerId,
        playerState
    )
    {


        if(
            !this.preparation
        )
        {

            return {

                success:false,

                reason:
                    "Battle preparation service unavailable"

            };

        }


        const preparation =
            this.preparation.prepareTrainerBattle(

                trainerId,

                playerState

            );


        if(
            !preparation
            ||
            !preparation.success
        )
        {

            return {

                success:false,

                reason:
                    preparation?.reason
                    ||
                    "Unable to prepare trainer battle"

            };

        }


        const battleId =
            this.createBattleId();


        const battle =
        {

            id:
                battleId,


            type:
                preparation.battleType
                ||
                "TRAINER",


            status:
                "ACTIVE",


            trainerId:
                trainerId,


            trainer:
                preparation.trainer
                ||
                null,


            player:
                preparation.player,


            opponent:
                preparation.opponent,


            turn:
                1,


            result:
                null,


            winner:
                null

        };


        //--------------------------------
        // Validate basic battle structure
        //--------------------------------

        if(
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
        )
        {

            return {

                success:false,

                reason:
                    "Invalid prepared battle"

            };

        }


        //--------------------------------
        // Store authoritative battle
        //--------------------------------

        this.activeBattles[battleId] =
            battle;


        //--------------------------------
        // Initialize battle engine
        //--------------------------------

        const initialization =
            this.initializeBattle(
                battle
            );


        if(
            !initialization.success
        )
        {

            delete this.activeBattles[
                battleId
            ];


            return initialization;

        }


        return {

            success:true,

            battleId,

            battle

        };


    }


    //--------------------------------
    // Start wild battle
    //--------------------------------

    startWildBattle(
        playerState,
        wildPokemon
    )
    {


        if(
            !wildPokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing wild Pokemon"

            };

        }


        if(
            !this.preparation
        )
        {

            return {

                success:false,

                reason:
                    "Battle preparation service unavailable"

            };

        }


        //--------------------------------
        // Get player party
        //--------------------------------

        const playerParty =

            this.preparation.getPlayerParty(

                playerState

            );


        if(
            !Array.isArray(playerParty)
            ||
            playerParty.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Player has no Pokémon"

            };

        }


        //--------------------------------
        // Prepare player party
        //--------------------------------

        const preparedPlayerParty =

            playerParty
                .map(

                    pokemon =>

                        this.preparation.preparePokemon(

                            pokemon

                        )

                )
                .filter(Boolean);


        if(
            preparedPlayerParty.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Player has no valid Pokémon"

            };

        }


        //--------------------------------
        // Prepare wild Pokémon
        //--------------------------------

        const preparedWildPokemon =

            this.preparation.preparePokemon(

                wildPokemon

            );


        if(
            !preparedWildPokemon
        )
        {

            return {

                success:false,

                reason:
                    "Invalid wild Pokémon"

            };

        }


        //--------------------------------
        // Create battle
        //--------------------------------

        const battleId =
            this.createBattleId();


        const battle =
        {

            id:
                battleId,


            type:
                "WILD",


            status:
                "ACTIVE",


            trainerId:
                null,


            trainer:
                null,


            player:
            {

                party:
                    preparedPlayerParty,


                active:
                    0

            },


            opponent:
            {

                party:
                [

                    preparedWildPokemon

                ],


                active:
                    0

            },


            turn:
                1,


            result:
                null,


            winner:
                null

        };


        //--------------------------------
        // Store authoritative battle
        //--------------------------------

        this.activeBattles[battleId] =
            battle;


        //--------------------------------
        // Initialize battle engine
        //--------------------------------

        const initialization =
            this.initializeBattle(
                battle
            );


        if(
            !initialization.success
        )
        {

            delete this.activeBattles[
                battleId
            ];


            return initialization;

        }


        return {

            success:true,

            battleId,

            battle

        };


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
        )
        {

            return {

                success:false,

                reason:
                    "Missing battle"

            };

        }


        if(
            !this.engine
        )
        {

            return {

                success:false,

                reason:
                    "Battle engine unavailable"

            };

        }


        return this.engine.initializeBattle(

            battle

        );


    }


    //--------------------------------
    // Get battle
    //--------------------------------

    getBattle(
        battleId
    )
    {


        return (

            this.activeBattles[battleId]

            ||

            null

        );


    }


    //--------------------------------
    // Get all battles
    //--------------------------------

    getBattles()
    {


        return Object.values(

            this.activeBattles

        );


    }


    //--------------------------------
    // Get active battles
    //--------------------------------

    getActiveBattles()
    {


        return Object.values(

            this.activeBattles

        )
        .filter(

            battle =>

                battle.status ===
                "ACTIVE"

        );


    }


    //--------------------------------
    // Check active
    //--------------------------------

    isActive(
        battleId
    )
    {


        const battle =
            this.getBattle(

                battleId

            );


        return !!(

            battle

            &&

            battle.status ===
                "ACTIVE"

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
            battle.status !==
            "ACTIVE"
        )
        {

            return {

                success:false,

                reason:
                    "Battle finished"

            };

        }


        if(
            !this.engine
        )
        {

            return {

                success:false,

                reason:
                    "Battle engine unavailable"

            };

        }


        const result =
            this.engine.processTurn(

                battle,

                playerMove

            );


        if(
            !result
        )
        {

            return {

                success:false,

                reason:
                    "Battle turn failed"

            };

        }


        //--------------------------------
        // Battle may have ended inside engine
        //--------------------------------

        if(
            battle.status !==
            "ACTIVE"
            &&
            !battle.result
        )
        {

            this.resolveBattleResult(
                battle
            );

        }


        return result;


    }


    //--------------------------------
    // Resolve battle result
    //--------------------------------

    resolveBattleResult(
        battle
    )
    {


        if(
            !battle
        )
        {

            return null;

        }


        const playerAlive =

            battle.player.party.some(

                pokemon =>
                    pokemon
                    &&
                    pokemon.hp > 0

            );


        const opponentAlive =

            battle.opponent.party.some(

                pokemon =>
                    pokemon
                    &&
                    pokemon.hp > 0

            );


        if(
            opponentAlive
            &&
            !playerAlive
        )
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "OPPONENT";


            battle.result =
            {

                winner:
                    "OPPONENT",


                outcome:
                    "DEFEAT"

            };


        }


        else if(
            playerAlive
            &&
            !opponentAlive
        )
        {

            battle.status =
                "COMPLETED";


            battle.winner =
                "PLAYER";


            battle.result =
            {

                winner:
                    "PLAYER",


                outcome:
                    "VICTORY"

            };

        }


        return {

            status:
                battle.status,


            winner:
                battle.winner,


            result:
                battle.result

        };


    }


    //--------------------------------
    // Complete battle
    //--------------------------------

    completeBattle(
        battleId,
        result = {}
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
            battle.status ===
            "COMPLETED"
        )
        {

            return {

                success:true,

                battleId,

                result:
                    battle.result

            };

        }


        //--------------------------------
        // Determine winner
        //--------------------------------

        const winner =
            result.winner
            ||
            this.resolveBattleResult(
                battle
            )?.winner
            ||
            null;


        battle.status =
            "COMPLETED";


        battle.winner =
            winner;


        battle.result =
        {

            ...result,

            winner:


                winner
                ||
                result.winner
                ||
                null

        };


        //--------------------------------
        // Battle rewards
        //--------------------------------

        let rewardResult =
            null;


        if(
            winner ===
            "PLAYER"
            &&
            this.rewards
        )
        {


            const defeatedPokemon =

                battle.opponent.party.find(

                    pokemon =>

                        pokemon
                        &&
                        pokemon.hp <= 0

                );


            const playerPokemon =

                battle.player.party.find(

                    pokemon =>

                        pokemon
                        &&
                        pokemon.hp > 0

                );


            if(
                defeatedPokemon
                &&
                playerPokemon
            )
            {


                rewardResult =

                    this.rewards.processBattleRewards(

                        playerPokemon,


                        defeatedPokemon,


                        battle.trainer
                        ?
                        battle.trainer.rewards
                        :
                        null,


                        battle.player,


                        battle.type ===
                        "WILD"

                        ?

                        "WILD"

                        :

                        "TRAINER"

                    );


                battle.result.rewards =
                    rewardResult;

            }

        }


        return {

            success:true,

            battleId,

            result:
                battle.result

        };


    }


    //--------------------------------
    // Victory
    //--------------------------------

    winBattle(
        battleId
    )
    {


        return this.completeBattle(

            battleId,

            {

                winner:
                    "PLAYER",


                outcome:
                    "VICTORY"

            }

        );


    }


    //--------------------------------
    // Loss
    //--------------------------------

    loseBattle(
        battleId
    )
    {


        return this.completeBattle(

            battleId,

            {

                winner:
                    "OPPONENT",


                outcome:
                    "DEFEAT"

            }

        );


    }


    //--------------------------------
    // Remove battle
    //--------------------------------

    clearBattle(
        battleId
    )
    {


        if(
            !this.activeBattles[battleId]
        )
        {

            return false;

        }


        delete this.activeBattles[
            battleId
        ];


        return true;


    }


    //--------------------------------
    // Statistics
    //--------------------------------

    getBattleCount()
    {


        return Object.keys(

            this.activeBattles

        )
        .length;


    }


}


module.exports =
    BattleService;