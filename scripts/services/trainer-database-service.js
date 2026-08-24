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








        const data =

            JSON.parse(

                fs.readFileSync(

                    databasePath,

                    "utf8"

                )

            );









        //--------------------------------
        // Handle generated wrapper
        //--------------------------------


        if(
            data.trainers
        )
        {

            return data.trainers;

        }








        return data;


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
        // Search trainers
        //--------------------------------


        return this.getAllTrainers()

            .find(

                trainer =>

                (

                    trainer.id &&

                    trainer.id.toUpperCase() === search

                )

                ||

                (

                    trainer.trainerName &&

                    trainer.trainerName.toUpperCase() === search

                )

                ||

                (

                    trainer.name &&

                    trainer.name.toUpperCase() === search

                )

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

        )

        .filter(

            trainer =>

                trainer &&

                typeof trainer === "object"

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
    // Filter by type
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








        return this.getAllTrainers()

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
    // Champions
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