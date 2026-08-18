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


//================================
// Container
//================================

const ServiceContainer =
    require("./container/service-container");


//================================
// Database Services
//================================

const PokemonDatabaseService =
    require("./services/pokemon-database-service");

const TrainerDatabaseService =
    require("./services/trainer-database-service");

const LocationDatabaseService =
    require("./services/location-database-service");

const GymDatabaseService =
    require("./services/gym-database-service");


//================================
// Progression Services
//================================

const ProgressionService =
    require("./services/progression-service");

const ProgressionRequirementService =
    require("./services/progression-requirement-service");

const GymProgressionService =
    require("./services/gym-progression-service");

const StoryProgressionService =
    require("./services/story-progression-service");


//================================
// World Services
//================================

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


//================================
// Gameplay Services
//================================

const TrainerService =
    require("./services/trainer-service");

const BattlePreparationService =
    require("./services/battle-preparation-service");

const BattleService =
    require("./services/battle-service");

const BattleAIService =
    require("./services/battle-ai-service");

const BattleEngineService =
    require("./services/battle-engine-service");


//================================
// Pokémon Progression
//================================

const EvolutionService =
    require("./services/evolution-service");

const ExperienceService =
    require("./services/experience-service");

const LevelUpService =
    require("./services/level-up-service");


//================================
// Pokémon Analysis
//================================

const PokemonAvailabilityService =
    require("./services/pokemon-availability-service");

const PokemonObtainabilityService =
    require("./services/pokemon-obtainability-service");

const TeamRecommendationService =
    require("./services/team-recommendation-service");


//================================
// Event Services
//================================

const EventService =
    require("./services/event-service");

const EventRewardService =
    require("./services/event-reward-service");

const RewardService =
    require("./services/reward-service");

const StoryEventService =
    require("./services/story-event-service");


//================================
// Capture Services
//================================

const CaptureService =
    require("./services/capture-service");

const WildBattleService =
    require("./services/wild-battle-service");


//--------------------------------
// NPC Services
//--------------------------------

const NPCService =
    require("./services/npc-service");


const NPCAvailabilityService =
    require("./services/npc-availability-service");


const NPCInteractionService =
    require("./services/npc-interaction-service");


const DialogueService =
    require("./services/dialogue-service");


//================================
// Gym Services
//================================

const GymService =
    require("./services/gym-service");


const GymLocationService =
    require("./services/gym-location-service");


const GymRewardService =
    require("./services/gym-reward-service");


const GymEventService =
    require("./services/gym-event-service");


//================================
// Location Services
//================================

const LocationAccessService =
    require("./services/location-access-service");


const LocationAnalysisService =
    require("./services/location-analysis-service");


const LocationAvailabilityService =
    require("./services/location-availability-service");


const MapAccessService =
    require("./services/map-access-service");


//================================
// Battle Support Services
//================================


const MoveExecutionService =
    require("./services/move-execution-service");


const StatusEffectService =
    require("./services/status-effect-service");


const PokemonSwitchService =
    require("./services/pokemon-switch-service");


//================================
// Trainer Analysis Services
//================================

const TrainerAnalysisService =
    require("./services/trainer-analysis-service");


const TrainerDifficultyService =
    require("./services/trainer-difficulty-service");


const TrainerRecommendationService =
    require("./services/trainer-recommendation-service");


//================================
// Pokémon Information Services
//================================

const PokemonExplanationService =
    require("./services/pokemon-explanation-service");


const PokemonSourceResolverService =
    require("./services/pokemon-source-resolver-service");


const PokemonTrackerService =
    require("./services/pokemon-tracker-service");


//================================
// Starter Services
//================================

const StarterSelectionService =
    require("./services/starter-selection-service");





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

        this.registerGymServices();

        this.registerLocationServices();

        this.registerBattleSupportServices();

        this.registerGameplayServices();

        this.registerEventServices();

        this.registerCaptureServices();

        this.registerPokemonInformationServices();

        this.registerStarterServices();

        this.registerNPCServices();

        this.registerTrainerAnalysisServices();

    }






    //================================
    // Database Layer
    //================================


    registerDatabaseServices()
    {


        this.container.register(

            "pokemonDatabase",

            new PokemonDatabaseService(
                this.game
            )

        );


        this.container.register(

            "trainerDatabase",

            new TrainerDatabaseService(
                this.game
            )

        );


        this.container.register(

            "locationDatabase",

            new LocationDatabaseService(
                this.game
            )

        );


        this.container.register(

            "gymDatabase",

            new GymDatabaseService(
                this.game
            )

        );


    }







    //================================
    // Progression Layer
    //================================


    registerProgressionServices()
    {


        const requirement =
            new ProgressionRequirementService();



        const progression =
            new ProgressionService(
                this.game
            );



        const gymProgression =
            new GymProgressionService(
                this.get(
                    "gymDatabase"
                )
            );



        const storyProgression =
            new StoryProgressionService(
                this.game
            );



        this.container.register(
            "progressionRequirement",
            requirement
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







    //================================
    // World Layer
    //================================


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






    //================================
    // Gym Layer
    //================================


    registerGymServices()
    {


        const gymReward =
            new GymRewardService(

                this.get(
                    "gymDatabase"
                )

            );



        const gymLocation =
            new GymLocationService(

                this.get(
                    "gymProgression"
                ),


                this.get(
                    "locationGraph"
                ),


                this.get(
                    "locationGate"
                ),


                this.get(
                    "fieldObstacle"
                )

            );



        const gym =
            new GymService(

                this.get(
                    "gymProgression"
                ),


                this.get(
                    "gymEventService"
                ),


                gymReward,


                this.get(
                    "trainerDatabase"
                )

            );




        this.container.register(
        
            "gymEventService",
        
            new GymEventService(
            
                this.get(
                    "gymDatabase"
                )
            
            )
        
        );



        this.container.register(

            "gymReward",

            gymReward

        );



        this.container.register(

            "gymLocation",

            gymLocation

        );



        this.container.register(

            "gym",

            gym

        );


    }






    //================================
    // Location Layer
    //================================
    
    
    registerLocationServices()
    {
    
    
        const locationAccess =
            new LocationAccessService(
            
                this.get(
                    "locationGraph"
                ),
            
                this.get(
                    "fieldObstacle"
                ),
            
                this.get(
                    "locationGate"
                ),
            
                this.get(
                    "progression"
                )
            
            );
        
        
        
        
        const locationAnalysis =
            new LocationAnalysisService(
            
                this.get(
                    "locationDatabase"
                )
            
            );
        
        
        
        
        const locationAvailability =
            new LocationAvailabilityService(
            
                this.get(
                    "locationDatabase"
                )
            
            );
        
        
        
        
        const mapAccess =
            new MapAccessService();
        
        
        
        
        
        
        this.container.register(
        
            "locationAccess",
        
            locationAccess
        
        );
    
    
    
    
        this.container.register(
        
            "locationAnalysis",
        
            locationAnalysis
        
        );
    
    
    
    
        this.container.register(
        
            "locationAvailability",
        
            locationAvailability
        
        );
    
    
    
    
        this.container.register(
        
            "mapAccess",
        
            mapAccess
        
        );
    
    
    }






    //================================
    // Battle Support Layer
    //================================


    registerBattleSupportServices()
    {


        const moveExecution =
            new MoveExecutionService();



        const statusEffect =
            new StatusEffectService();



        const pokemonSwitch =
            new PokemonSwitchService();






        this.container.register(

            "moveExecution",

            moveExecution

        );



        this.container.register(

            "statusEffect",

            statusEffect

        );



        this.container.register(

            "pokemonSwitch",

            pokemonSwitch

        );


    }






    //================================
    // Gameplay Layer
    //================================


    registerGameplayServices()
    {


        const trainer =
            new TrainerService(
                this.get(
                    "trainerDatabase"
                )
            );


        const battlePreparation =
            new BattlePreparationService(
                trainer
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
                this.get(
                    "pokemonDatabase"
                )
            );



        const experience =
            new ExperienceService(
                this.get(
                    "pokemonDatabase"
                )
            );



        const levelUp =
            new LevelUpService(
                this.get(
                    "pokemonDatabase"
                ),
                experience,
                evolution
            );



        const availability =
            new PokemonAvailabilityService(

                this.get(
                    "pokemonDatabase"
                ),

                this.get(
                    "locationDatabase"
                ),

                evolution

            );



        const obtainability =
            new PokemonObtainabilityService(
                availability
            );



        const recommendation =
            new TeamRecommendationService(
                availability
            );



        this.container.register(
            "trainerService",
            trainer
        );


        this.container.register(
            "battlePreparation",
            battlePreparation
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
            "battle",
            battle
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
            availability
        );


        this.container.register(
            "pokemonObtainability",
            obtainability
        );


        this.container.register(
            "teamRecommendation",
            recommendation
        );


    }







    //================================
    // Event Layer
    //================================


    registerEventServices()
    {


        this.container.register(

            "rewardService",

            new RewardService()

        );


        this.container.register(

            "eventRewardService",

            new EventRewardService()

        );


        this.container.register(

            "eventService",

            new EventService(
                this.game
            )

        );


        this.container.register(

            "storyEventService",

            new StoryEventService(
                this.game
            )

        );


    }







    //================================
    // Capture Layer
    //================================


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





    //================================
    // Pokémon Information Layer
    //================================


    registerPokemonInformationServices()
    {


        const explanation =
            new PokemonExplanationService();



        const sourceResolver =
            new PokemonSourceResolverService(

                [],

                this.get(
                    "evolution"
                )

            );



        const tracker =
            new PokemonTrackerService();





        this.container.register(

            "pokemonExplanation",

            explanation

        );



        this.container.register(

            "pokemonSourceResolver",

            sourceResolver

        );



        this.container.register(

            "pokemonTracker",

            tracker

        );


    }





    //================================
    // Starter Layer
    //================================
    
    
    registerStarterServices()
    {
    
    
        const starterSelection =
            new StarterSelectionService();
    
    
    
    
        this.container.register(
        
            "starterSelection",
        
            starterSelection
        
        );
    
    
    }





    //================================
    // NPC Layer
    //================================


    registerNPCServices()
    {


        const npcService =
            new NPCService(
                this.game
            );



        const npcAvailability =
            new NPCAvailabilityService();



        const npcInteraction =
            new NPCInteractionService();



        const dialogue =
            new DialogueService(
                this.game
            );





        this.container.register(

            "npcService",

            npcService

        );



        this.container.register(

            "npcAvailability",

            npcAvailability

        );



        this.container.register(

            "npcInteraction",

            npcInteraction

        );



        this.container.register(

            "dialogue",

            dialogue

        );


    }





    //================================
    // Trainer Analysis Layer
    //================================


    registerTrainerAnalysisServices()
    {


        const trainerAnalysis =
            new TrainerAnalysisService(

                this.get(
                    "trainerDatabase"
                ),

                this.get(
                    "pokemonDatabase"
                )

            );



        const trainerDifficulty =
            new TrainerDifficultyService();



        const trainerRecommendation =
            new TrainerRecommendationService(

                this.get(
                    "pokemonDatabase"
                )

            );





        this.container.register(

            "trainerAnalysis",

            trainerAnalysis

        );



        this.container.register(

            "trainerDifficulty",

            trainerDifficulty

        );



        this.container.register(

            "trainerRecommendation",

            trainerRecommendation

        );


    }





    //================================
    // Access
    //================================


    get(
        name
    )
    {

        return this.container.get(
            name
        );

    }



    getContainer()
    {

        return this.container;

    }


}



module.exports =
    AppContainer;