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
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Handle battle AI.
 * - Manage turn order.
 */

"use strict";





class BattleService {



    constructor(
        battlePreparationService,
        battleEngineService,
        pokemonProgressionService,
        experienceService,
        rewardService
    )
    {


        this.preparation =
            battlePreparationService;



        this.engine =
            battleEngineService;



        this.progression =
            pokemonProgressionService;


        this.experience =
            experienceService;


        this.rewards =
            rewardService;



        this.activeBattles =
        {};



        this.nextBattleId =
            1;


    }









    //--------------------------------
    // Start trainer battle
    //--------------------------------


    startTrainerBattle(
        trainerId,
        playerState
    )
    {


        const preparation =
            this.preparation
                .prepareTrainerBattle(

                    trainerId,

                    playerState

                );



        if(
            !preparation.success
        )
        {

            return {

                success:false,

                reason:
                    preparation.reason

            };

        }








        const battleId =
            `BATTLE_${this.nextBattleId++}`;








        const battle =
        {

            id:
                battleId,


            type:
                preparation.battleType,


            status:
                "ACTIVE",


            trainerId,


            trainer:
                preparation.trainer,


            player:
                preparation.player,


            opponent:
                preparation.opponent,


            result:
                null


        };








        this.activeBattles[battleId] =
            battle;








        //--------------------------------
        // Initialize Engine
        //--------------------------------


        if(
            this.engine
        )
        {

            this.engine.initializeBattle(
                battle
            );

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








        const battleId =
            `BATTLE_${this.nextBattleId++}`;








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

                    playerState.party

            },


            opponent:
            {

                party:

                [

                    wildPokemon

                ]

            },


            result:
                null


        };








        this.activeBattles[battleId] =
            battle;








        //--------------------------------
        // Initialize Engine
        //--------------------------------


        if(
            this.engine
        )
        {

            this.engine.initializeBattle(
                battle
            );

        }








        return {


            success:true,


            battleId,


            battle



        };


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
    // Active battles
    //--------------------------------


    getActiveBattles()
    {

        return Object.values(

            this.activeBattles

        )
        .filter(

            battle =>

                battle.status === "ACTIVE"

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



        return (

            battle

            &&

            battle.status === "ACTIVE"

        );


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




        battle.status =
            "COMPLETED";



        battle.result =
            result;





        //--------------------------------
        // Give EXP reward
        //--------------------------------


        if(
            result.winner === "PLAYER"
            &&
            this.progression
        )
        {


            const defeated =
                battle.opponent.party[
                    0
                ];



            const playerPokemon =
                battle.player.party.filter(
                
                    pokemon =>
                        pokemon.hp > 0
                
                )[0];




            const exp =
                this.experience.calculateExp(

                    defeated,

                    battle.type === "WILD"
                    ?
                    "WILD"
                    :
                    "TRAINER"

                );





            result.exp =
                this.progression.processProgression(

                    playerPokemon,

                    exp

                );


        }








        return {


            success:true,


            battleId,


            result



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



        delete this.activeBattles[battleId];


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