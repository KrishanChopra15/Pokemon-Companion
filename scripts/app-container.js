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


//--------------------------------
// Progression Services
//--------------------------------

const ProgressionService =
    require("./services/progression-service");


const ProgressionRequirementService =
    require("./services/progression-requirement-service");


const GymProgressionService =
    require("./services/gym-progression-service");


const StoryProgressionService =
    require("./services/story-progression-service");





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
            
    
        this.registerProgressionServices();


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
    // Register progression layer
    //--------------------------------

    registerProgressionServices()
    {


        const progressionRequirement =
            new ProgressionRequirementService();



        const progression =
            new ProgressionService(
                this.game
            );



        const gymProgression =
            new GymProgressionService(
                this.get("gymDatabase")
            );



        const storyProgression =
            new StoryProgressionService(
                this.game
            );






        this.container.register(

            "progressionRequirement",

            progressionRequirement

        );



        this.container.register(

            "progression",

            progression

        );



        this.container.register(

            "gymProgression",

            gymProgression

        );



        this.container.register(

            "storyProgression",

            storyProgression

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