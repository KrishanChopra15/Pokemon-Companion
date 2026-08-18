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


//--------------------------------
// World Services
//--------------------------------

const LocationGraphService =
    require("./services/location-graph-service");


const LocationGateService =
    require("./services/location-gate-service");


const FieldObstacleService =
    require("./services/field-obstacle-service");


const WorldStateService =
    require("./services/world-state-service");


const WorldProgressionService =
    require("./services/world-progression-service");


const ObjectiveService =
    require("./services/objective-service");


//--------------------------------
// Gameplay Services
//--------------------------------

const TrainerService =
    require("./services/trainer-service");


const BattlePreparationService =
    require("./services/battle-preparation-service");


const BattleService =
    require("./services/battle-service");


//--------------------------------
// Battle Services
//--------------------------------

const BattleEngineService =
    require("./services/battle-engine-service");


const BattleAIService =
    require("./services/battle-ai-service");


//--------------------------------
// Pokémon Progression Services
//--------------------------------

const EvolutionService =
    require("./services/evolution-service");


const ExperienceService =
    require("./services/experience-service");


const LevelUpService =
    require("./services/level-up-service");


//--------------------------------
// Pokémon Analysis Services
//--------------------------------

const PokemonAvailabilityService =
    require("./services/pokemon-availability-service");


const PokemonObtainabilityService =
    require("./services/pokemon-obtainability-service");


const TeamRecommendationService =
    require("./services/team-recommendation-service");


//--------------------------------
// Event Services
//--------------------------------

const EventService =
    require("./services/event-service");


const EventRewardService =
    require("./services/event-reward-service");


const RewardService =
    require("./services/reward-service");


const StoryEventService =
    require("./services/story-event-service");


//--------------------------------
// Capture / Wild Battle Services
//--------------------------------

const CaptureService =
    require("./services/capture-service");


const WildBattleService =
    require("./services/wild-battle-service");





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


        this.registerWorldServices();

        
        this.registerGameplayServices();


        this.registerEventServices();


        this.registerCaptureServices();

        
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
    // Register world layer
    //--------------------------------

    registerWorldServices()
    {


        const locationGraph =
            new LocationGraphService(
                this.game
            );



        const locationGate =
            new LocationGateService(
                this.game,

                this.get("progression")
            );



        const fieldObstacle =
            new FieldObstacleService(
                this.game,

                this.get("progression")
            );



        const worldState =
            new WorldStateService(
                this.game
            );



        const worldProgression =
            new WorldProgressionService(

                this.get("storyProgression"),

                this.get("gymProgression"),

                this.get("progression")

            );



        const objective =
            new ObjectiveService(

                this.get("storyProgression"),

                this.get("gymProgression"),

                this.get("progression")

            );





        this.container.register(

            "locationGraph",

            locationGraph

        );



        this.container.register(

            "locationGate",

            locationGate

        );



        this.container.register(

            "fieldObstacle",

            fieldObstacle

        );



        this.container.register(

            "worldState",

            worldState

        );



        this.container.register(

            "worldProgression",

            worldProgression

        );



        this.container.register(

            "objective",

            objective

        );


    }






    //--------------------------------
    // Register gameplay layer
    //--------------------------------

    registerGameplayServices()
    {


        const trainerService =
            new TrainerService(

                this.get("trainerDatabase")

            );



        const battlePreparation =
            new BattlePreparationService(

                trainerService

            );



        const battleAI =
            new BattleAIService();
                
                
                
        const battleEngine =
            new BattleEngineService(
            
                battleAI
            
            );
        
        
        
        const battle =
            new BattleService(
            
                battlePreparation
            
            );



        const evolution =
            new EvolutionService(
            
                this.get("pokemonDatabase")
            
            );
        
        
        
        const experience =
            new ExperienceService(
            
                this.get("pokemonDatabase")
            
            );
        
        
        
        const levelUp =
            new LevelUpService(
            
                this.get("pokemonDatabase"),
            
                experience,
            
                evolution
            
            );



        const pokemonAvailability =
            new PokemonAvailabilityService(
            
                this.get("pokemonDatabase"),
            
                this.get("locationDatabase"),
            
                this.get("evolution"),
            
                null,
            
                null,
            
                null
            
            );
        
        
        
        const pokemonObtainability =
            new PokemonObtainabilityService(
            
                pokemonAvailability
            
            );
        
        
        
        const teamRecommendation =
            new TeamRecommendationService(
            
                pokemonAvailability
            
            );






        this.container.register(

            "trainerService",

            trainerService

        );



        this.container.register(

            "battlePreparation",

            battlePreparation

        );



        this.container.register(

            "battle",

            battle

        );



        this.container.register(
        
            "battleAI",
        
            battleAI
        
        );



        this.container.register(
        
            "battleEngine",
        
            battleEngine
        
        );



        this.container.register(
        
            "evolution",
        
            evolution
        
        );



        this.container.register(
        
            "experience",
        
            experience
        
        );



        this.container.register(
        
            "levelUp",
        
            levelUp
        
        );



        this.container.register(
        
            "pokemonAvailability",
        
            pokemonAvailability
        
        );



        this.container.register(
        
            "pokemonObtainability",
        
            pokemonObtainability
        
        );



        this.container.register(
        
            "teamRecommendation",
        
            teamRecommendation
        
        );


    }
    




    //--------------------------------
    // Register Event Services
    //--------------------------------

    registerEventServices()
    {

        const rewardService =
            new RewardService();


        const eventRewardService =
            new EventRewardService();


        const eventService =
            new EventService(
                this.game
            );


        const storyEventService =
            new StoryEventService(
                this.game
            );



        this.container.register(

            "rewardService",

            rewardService

        );



        this.container.register(

            "eventRewardService",

            eventRewardService

        );



        this.container.register(

            "eventService",

            eventService

        );



        this.container.register(

            "storyEventService",

            storyEventService

        );


    }





    //--------------------------------
    // Register Capture Services
    //--------------------------------

    registerCaptureServices()
    {

        const captureService =
            new CaptureService();



        const wildBattleService =
            new WildBattleService();



        this.container.register(

            "captureService",

            captureService

        );



        this.container.register(

            "wildBattleService",

            wildBattleService

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