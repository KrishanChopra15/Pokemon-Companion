/**
 * Pokémon Companion
 * Trainer Database Service
 *
 * Provides access to generated trainer databases.
 *
 * Responsibilities:
 * - Load trainer database.
 * - Query trainers.
 * - Provide trainer parties.
 * - Find trainer groups.
 *
 * Does NOT:
 * - Parse source files.
 * - Generate databases.
 * - Build databases.
 * - Execute battles.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class TrainerDatabaseService {



    constructor(
        game = "firered"
    )
    {


        this.game =
            game;


        this.trainers =
            this.loadDatabase();


    }









    //--------------------------------
    // Load database
    //--------------------------------


    loadDatabase()
    {


        const databasePath =
            path.join(

                process.cwd(),

                "database",

                "generated",

                this.game,

                "full-trainers.json"

            );



        if(
            !fs.existsSync(databasePath)
        )
        {

            console.warn(
                "Trainer database not found:",
                databasePath
            );


            return {};

        }




        return JSON.parse(

            fs.readFileSync(

                databasePath,

                "utf8"

            )

        );


    }









    //--------------------------------
    // Get trainer
    //--------------------------------


    getTrainer(
        id
    )
    {


        //--------------------------------
        // Direct ID lookup
        //--------------------------------


        if(
            this.trainers[id]
        )
        {

            return this.trainers[id];

        }






        //--------------------------------
        // Resolve by trainer name
        //--------------------------------


        return this.getAllTrainers()
            .find(

                trainer =>

                    trainer.trainerName === id

            )

            ||

            null;


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
    // All trainers
    //--------------------------------


    getAllTrainers()
    {

        return Object.values(

            this.trainers

        );

    }









    //--------------------------------
    // Trainer party
    //--------------------------------


    getParty(
        id
    )
    {


        const trainer =
            this.getTrainer(
                id
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
    // Filter
    //--------------------------------


    getByType(
        type
    )
    {

        return this.getAllTrainers()
            .filter(

                trainer =>

                    trainer.trainerType === type

            );

    }









    //--------------------------------
    // Gym leaders
    //--------------------------------


    getGymLeaders()
    {

        return this.getByType(

            "GYM_LEADER"

        );

    }









    //--------------------------------
    // Elite Four
    //--------------------------------


    getEliteFour()
    {

        return this.getByType(

            "ELITE_FOUR"

        );

    }









    //--------------------------------
    // Champion
    //--------------------------------


    getChampions()
    {

        return this.getByType(

            "CHAMPION"

        );

    }









    //--------------------------------
    // Villain team
    //--------------------------------


    getVillainTeam()
    {

        return this.getByType(

            "VILLAIN_TEAM"

        );

    }









    //--------------------------------
    // Reload
    //--------------------------------


    reload()
    {

        this.trainers =
            this.loadDatabase();


        return this.trainers;

    }



}





module.exports =
    TrainerDatabaseService;