/**
 * Pokémon Companion
 * Application Container
 *
 * Creates and wires application services.
 *
 * Responsibilities:
 * - Create service container.
 * - Register shared services.
 * - Resolve service dependencies.
 *
 * Does NOT:
 * - Execute game logic.
 * - Handle requests.
 * - Modify trainer state.
 * - Build databases.
 */

"use strict";


//--------------------------------
// Container
//--------------------------------

const ServiceContainer =
    require("./container/service-container");



//--------------------------------
// Database Services
//--------------------------------

const PokemonDatabaseService =
    require("./services/pokemon-database-service");


const TrainerDatabaseService =
    require("./services/trainer-database-service");


const LocationDatabaseService =
    require("./services/location-database-service");


const GymDatabaseService =
    require("./services/gym-database-service");





class AppContainer {



    constructor(
        game = "firered"
    )
    {


        this.container =
            new ServiceContainer();



        this.game =
            game;



        this.registerDatabaseServices();


    }






    //--------------------------------
    // Register database layer
    //--------------------------------


    registerDatabaseServices()
    {


        const pokemonDatabase =
            new PokemonDatabaseService(
                this.game
            );


        const trainerDatabase =
            new TrainerDatabaseService(
                this.game
            );


        const locationDatabase =
            new LocationDatabaseService(
                this.game
            );


        const gymDatabase =
            new GymDatabaseService(
                this.game
            );





        this.container.register(

            "pokemonDatabase",

            pokemonDatabase

        );



        this.container.register(

            "trainerDatabase",

            trainerDatabase

        );



        this.container.register(

            "locationDatabase",

            locationDatabase

        );



        this.container.register(

            "gymDatabase",

            gymDatabase

        );


    }






    //--------------------------------
    // Get service
    //--------------------------------


    get(
        name
    )
    {

        return this.container.get(
            name
        );

    }





    //--------------------------------
    // Expose container
    //--------------------------------


    getContainer()
    {

        return this.container;

    }


}




module.exports =
    AppContainer;