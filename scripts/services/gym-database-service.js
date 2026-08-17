/**
 * Pokémon Companion
 * Gym Database Service
 *
 * Provides access to generated gym database.
 *
 * Responsibilities:
 * - Load gym database.
 * - Retrieve gym records.
 * - Find gyms.
 * - Provide gym metadata.
 * - Provide rewards and events.
 *
 * Does NOT:
 * - Check progression.
 * - Handle battles.
 * - Apply rewards.
 * - Manage trainer state.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class GymDatabaseService {



    constructor(
        game = "firered"
    )
    {

        this.game =
            game;


        this.gyms =
            this.loadDatabase();


    }









    //--------------------------------
    // Load database
    //--------------------------------


    loadDatabase()
    {


        const file =
            path.join(

                process.cwd(),

                "database",

                "generated",

                this.game,

                "gyms.json"

            );



        if(
            !fs.existsSync(file)
        )
        {

            console.warn(
                "Gym database not found:",
                file
            );


            return {};

        }






        try
        {

            return JSON.parse(

                fs.readFileSync(

                    file,

                    "utf8"

                )

            );

        }

        catch(error)
        {

            console.error(
                "Failed loading gym database:",
                error.message
            );


            return {};

        }


    }









    //--------------------------------
    // Get all gyms
    //--------------------------------


    getAllGyms()
    {

        return Object.values(

            this.gyms

        )
        .sort(

            (a,b)=>

                a.order - b.order

        );

    }









    //--------------------------------
    // Count
    //--------------------------------


    getGymCount()
    {

        return this.getAllGyms()
            .length;

    }









    //--------------------------------
    // Get gym
    //--------------------------------


    getGym(
        gymId
    )
    {


        return (

            this.gyms[gymId]

            ||

            null

        );


    }









    //--------------------------------
    // Exists
    //--------------------------------


    hasGym(
        gymId
    )
    {

        return Boolean(

            this.gyms[gymId]

        );

    }









    //--------------------------------
    // Search
    //--------------------------------


    getGymByCity(
        city
    )
    {

        return this.getAllGyms()
            .find(

                gym =>

                    gym.city === city

            )

            ||

            null;

    }









    getGymByBadge(
        badge
    )
    {

        return this.getAllGyms()
            .find(

                gym =>

                    gym.badge === badge

            )

            ||

            null;

    }









    getGymByTrainer(
        trainer
    )
    {

        return this.getAllGyms()
            .find(

                gym =>

                    gym.trainer === trainer

            )

            ||

            null;

    }









    //--------------------------------
    // Battle event
    //--------------------------------


    getBattleEvent(
        gymId
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        return gym
            ?
            gym.battleEvent
            :
            null;


    }









    //--------------------------------
    // Badge
    //--------------------------------


    getBadge(
        gymId
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        return gym
            ?
            gym.badge
            :
            null;


    }









    //--------------------------------
    // Rewards
    //--------------------------------


    getRewards(
        gymId
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        return gym
            ?
            (
                gym.rewards
                ||
                {}
            )
            :
            null;


    }









    //--------------------------------
    // Requirements
    //--------------------------------


    getRequirements(
        gymId
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        return gym
            ?
            (
                gym.requirements
                ||
                {}
            )
            :
            null;


    }









    //--------------------------------
    // Order
    //--------------------------------


    getOrder(
        gymId
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        return gym
            ?
            gym.order
            :
            null;


    }









    //--------------------------------
    // Gym by order
    //--------------------------------


    getGymByOrder(
        order
    )
    {


        return this.getAllGyms()
            .find(

                gym =>

                    gym.order === order

            )

            ||

            null;


    }









    //--------------------------------
    // First gym
    //--------------------------------


    getFirstGym()
    {

        return this.getGymByOrder(
            1
        );

    }









    //--------------------------------
    // Last gym
    //--------------------------------


    getLastGym()
    {

        return this.getGymByOrder(

            this.getGymCount()

        );

    }









    //--------------------------------
    // Next gym
    //--------------------------------


    getNextGym(
        order
    )
    {


        return this.getGymByOrder(

            order + 1

        );


    }









    //--------------------------------
    // Battle events
    //--------------------------------


    getAllBattleEvents()
    {

        return this.getAllGyms()
            .map(

                gym =>

                ({

                    gym:
                        gym.id,


                    event:
                        gym.battleEvent


                })

            );


    }









    //--------------------------------
    // Reload
    //--------------------------------


    reload()
    {

        this.gyms =
            this.loadDatabase();


        return this.gyms;

    }



}





module.exports =
    GymDatabaseService;