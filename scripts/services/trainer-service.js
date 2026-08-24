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
    
    
        //--------------------------------
        // Accept TrainerDatabaseService
        //--------------------------------
    
    
        if(
            trainerDatabase &&
            trainerDatabase.trainers
        )
        {
        
            this.trainers =
                trainerDatabase.trainers;
        
        }
    
        else
        {
        
            this.trainers =
                trainerDatabase;
        
        }
    
    
    }









    //--------------------------------
    // Normalize trainer list
    //--------------------------------


    getTrainerList()
    {


        if(
            Array.isArray(this.trainers)
        )
        {

            return this.trainers;

        }





        if(
            this.trainers &&
            typeof this.trainers === "object"
        )
        {

            return Object.values(

                this.trainers

            );

        }





        return [];


    }









    //--------------------------------
    // Get trainer
    //--------------------------------


    getTrainer(
        id
    )
    {


        if(
            !id
        )
        {

            return null;

        }





        const search =

            String(id)
                .toUpperCase();





        const trainers =

            this.getTrainerList();









        //--------------------------------
        // Direct ID lookup
        //--------------------------------


        const byId =

            trainers.find(

                trainer =>

                    trainer.id &&

                    trainer.id.toUpperCase() === search

            );





        if(
            byId
        )
        {

            return byId;

        }









        //--------------------------------
        // Trainer name lookup
        //--------------------------------


        const byName =

            trainers.find(

                trainer =>

                (

                    trainer.trainerName &&

                    trainer.trainerName.toUpperCase() === search

                )

                ||

                (

                    trainer.name &&

                    trainer.name.toUpperCase() === search

                )

            );





        return (

            byName

            ||

            null

        );


    }









    //--------------------------------
    // Exists
    //--------------------------------


    hasTrainer(
        id
    )
    {


        return (

            this.getTrainer(

                id

            )

            !==

            null

        );


    }









    //--------------------------------
    // Get all trainers
    //--------------------------------


    getAllTrainers()
    {


        return this.getTrainerList();


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
            trainer.trainerType !== "GYM_LEADER"
            &&
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





        return (

            trainer.party

            ||

            []

        );


    }









    //--------------------------------
    // Prepare battle trainer
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

                id:
                    trainer.id,


                name:

                    trainer.trainerName
                    ||
                    trainer.name,


                type:

                    trainer.trainerType
                    ||
                    trainer.type,


                party:

                    trainer.party
                    ||
                    []

            }

        };


    }









    //--------------------------------
    // Search by type
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





        const search =

            type.toUpperCase();





        return this.getTrainerList()

            .filter(

                trainer =>

                (

                    trainer.trainerType &&

                    trainer.trainerType.toUpperCase() === search

                )

                ||

                (

                    trainer.type &&

                    trainer.type.toUpperCase() === search

                )

            );


    }









    //--------------------------------
    // Count
    //--------------------------------


    count()
    {

        return this.getTrainerList().length;


    }



}





module.exports =
    TrainerService;