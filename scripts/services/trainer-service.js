/**
 * Pokémon Companion
 * Trainer Service
 *
 * Handles trainer data access.
 *
 * Responsibilities:
 * - Load trainer database.
 * - Find trainers.
 * - Get trainer teams.
 * - Return battle-ready trainer data.
 *
 * Does NOT:
 * - Execute battles.
 * - Calculate damage.
 * - Handle AI.
 * - Recommend teams.
 * - Manage progression.
 */

"use strict";


class TrainerService {



    constructor(
        trainerDatabase = []
    )
    {


        this.trainers =
            trainerDatabase;


    }









    //--------------------------------
    // Get trainer
    //--------------------------------


    getTrainer(
        name
    )
    {


        if(
            !name
        )
        {

            return null;

        }








        return this.trainers.find(

            trainer =>

                trainer.name ===
                name.toUpperCase()

        )

        ||

        null;


    }









    //--------------------------------
    // Get all trainers
    //--------------------------------


    getAllTrainers()
    {

        return this.trainers;

    }









    //--------------------------------
    // Get gym leader
    //--------------------------------


    getGymLeader(
        name
    )
    {


        const trainer =
            this.getTrainer(

                name

            );








        if(
            !trainer
        )
        {

            return null;

        }








        if(
            trainer.type !== "GYM_LEADER"
        )
        {

            return null;

        }








        return trainer;


    }









    //--------------------------------
    // Get trainer party
    //--------------------------------


    getParty(
        name
    )
    {


        const trainer =
            this.getTrainer(

                name

            );








        if(
            !trainer
        )
        {

            return [];

        }








        return trainer.party || [];


    }









    //--------------------------------
    // Prepare battle opponent
    //--------------------------------


    createBattleTrainer(
        name
    )
    {


        const trainer =
            this.getTrainer(

                name

            );








        if(
            !trainer
        )
        {

            return {


                success:false,


                reason:
                    "Trainer not found"


            };

        }








        return {


            success:true,


            trainer:
            {

                name:
                    trainer.name,


                type:
                    trainer.type,


                party:
                    trainer.party || []


            }


        };


    }









    //--------------------------------
    // Search trainers by type
    //--------------------------------


    getByType(
        type
    )
    {


        if(
            !type
        )
        {

            return [];

        }








        return this.trainers.filter(

            trainer =>

                trainer.type ===

                type.toUpperCase()

        );


    }









    //--------------------------------
    // Count trainers
    //--------------------------------


    count()
    {

        return this.trainers.length;

    }



}





module.exports =
    TrainerService;