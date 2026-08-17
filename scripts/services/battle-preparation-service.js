/**
 * Pokémon Companion
 * Battle Preparation Service
 *
 * Prepares data required to start a battle.
 *
 * Responsibilities:
 * - Resolve player battle party.
 * - Resolve opponent trainer party.
 * - Prepare trainer battle metadata.
 * - Prepare AI configuration.
 * - Validate battle participants.
 *
 * Does NOT:
 * - Execute battles.
 * - Calculate damage.
 * - Handle move selection.
 * - Manage battle turns.
 */

"use strict";





class BattlePreparationService {



    constructor(
        trainerDatabaseService = null
    )
    {

        this.trainers =
            trainerDatabaseService;


    }









    //--------------------------------
    // Prepare trainer battle
    //--------------------------------


    prepareTrainerBattle(
        trainerId,
        playerState
    )
    {


        const trainer =
            this.getTrainer(
                trainerId
            );



        if(
            !trainer
        )
        {

            return {

                success:false,

                reason:
                    "Unknown trainer"

            };

        }








        const playerParty =
            this.getPlayerParty(
                playerState
            );



        if(
            playerParty.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Player has no Pokémon"

            };

        }








        const opponentParty =
            this.getTrainerParty(
                trainerId
            );



        if(
            opponentParty.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Trainer has no Pokémon"

            };

        }








        return {

            success:true,


            battleType:
                "TRAINER",


            trainerId,


            trainer,


            player:
            {
                party:
                    playerParty,

            
                active:
                    0
                    
            },



            opponent:
            {
                party:
                    opponentParty,
            

                active:
                    0,


                trainerClass:
                    trainer.trainerClass,


                trainerPic:
                    trainer.trainerPic,


                aiFlags:
                    trainer.aiFlags,


                encounterMusic:
                    trainer.encounterMusic

            }


        };


    }









    //--------------------------------
    // Get trainer
    //--------------------------------


    getTrainer(
        trainerId
    )
    {


        if(
            !this.trainers
        )
        {

            return null;

        }



        return this.trainers.getTrainer(

            trainerId

        );


    }









    //--------------------------------
    // Get trainer party
    //--------------------------------


    getTrainerParty(
        trainerId
    )
    {


        const trainer =
            this.getTrainer(
                trainerId
            );



        if(
            !trainer
        )
        {

            return [];

        }



        if(
            Array.isArray(
                trainer.party
            )
        )
        {

            return trainer.party;

        }



        if(
            trainer.party
            &&
            Array.isArray(
                trainer.party.pokemon
            )
        )
        {

            return trainer.party.pokemon;

        }



        return [];

    }









    //--------------------------------
    // Player party
    //--------------------------------


    getPlayerParty(
        playerState
    )
    {


        if(
            !playerState
        )
        {

            return [];

        }



        if(
            playerState.pokemon
        )
        {

            return playerState.pokemon;

        }



        if(
            playerState.team
        )
        {

            return playerState.team;

        }



        return [];

    }









    //--------------------------------
    // Check battle ready
    //--------------------------------


    canBattle(
        trainerId,
        playerState
    )
    {


        const result =
            this.prepareTrainerBattle(

                trainerId,

                playerState

            );



        return result.success;


    }









    //--------------------------------
    // Get battle summary
    //--------------------------------


    getBattleSummary(
        trainerId
    )
    {


        const trainer =
            this.getTrainer(
                trainerId
            );



        if(
            !trainer
        )
        {

            return null;

        }



        return {


            trainerId,


            name:
                trainer.trainerName,


            type:
                trainer.trainerType,


            class:
                trainer.trainerClass,


            party:

                this.getTrainerParty(

                    trainerId

                )


        };


    }



}





module.exports =
    BattlePreparationService;