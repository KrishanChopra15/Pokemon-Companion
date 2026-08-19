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

const MoveDatabaseService =
    require("./services/move-database-service");

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

const CaptureFlow =
    require("./capture/capture-flow");

const CaptureManager =
    require("./capture/capture-manager");


//================================
// Storage Services
//================================

const StorageManager =
    require("./storage/storage-manager");

const StorageFlow =
    require("./storage/storage-flow");


//================================
// Action Services
//================================

const ActionManager =
    require("./action/action-manager");

const ActionFlow =
    require("./action/action-flow");


//================================
// Encounter Services
//================================

const EncounterManager =
    require("./encounter/encounter-manager");

const EncounterFlow =
    require("./encounter/encounter-flow");

const EncounterBattleFlow =
    require("./encounter/encounter-battle-flow");


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

const MoveMachineService =
    require("./services/move-machine-service");

const MoveLearningService =
    require("./services/move-learning-service");

const MoveReplacementService =
    require("./services/move-replacement-service");

const StatusEffectService =
    require("./services/status-effect-service");

const PokemonSwitchService =
    require("./services/pokemon-switch-service");


//================================
// Battle Active Services
//================================

const BattleActiveManager =
    require("./battle-active/battle-active-manager");

const BattleActiveFlow =
    require("./battle-active/battle-active-flow");


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


//================================
// Pokémon Utility Services
//================================

const EvolutionRequirementService =
    require("./services/evolution-requirement-service");

const GrowthRateService =
    require("./services/growth-rate-service");

const PokemonProgressionService =
    require("./services/pokemon-progression-service");


//================================
// Session
//================================

const GameSession =
    require("./session/game-session");


//================================
// World Runtime
//================================

const WorldManager =
    require("./world/world-manager");

const WorldFlow =
    require("./world/world-flow");


//================================
// Team Services
//================================

const TeamManager =
    require("./team/team-manager");

const TeamFlow =
    require("./team/team-flow");


//================================
// Active Pokémon Services
//================================

const ActivePokemonManager =
    require("./team-active/active-pokemon-manager");

const ActivePokemonFlow =
    require("./team-active/active-pokemon-flow");


//================================
// Battle Opponent Services
//================================

const BattleOpponentManager =
    require("./battle-opponent/battle-opponent-manager");

const BattleOpponentFlow =
    require("./battle-opponent/battle-opponent-flow");


//================================
// Battle State Services
//================================

const BattleStateManager =
    require("./battle-state/battle-state-manager");

const BattleStateFlow =
    require("./battle-state/battle-state-flow");


//================================
// Inventory Services
//================================

const InventoryManager =
    require("./inventory/inventory-manager");

const InventoryFlow =
    require("./inventory/inventory-flow");


//================================
// Save Services
//================================

const SaveManager =
    require("./save/save-manager");





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


        //================================
        // Battle Dependencies
        //================================

        this.registerBattleSupportServices();


        //================================
        // Team Dependencies
        //================================

        this.registerTeamServices();

        this.registerActivePokemonServices();


        //================================
        // Battle State Dependencies
        //================================

        this.registerBattleActiveServices();

        this.registerBattleOpponentServices();

        this.registerBattleStateServices();


        //================================
        // Pokémon Utility Dependencies
        //================================
            
        this.registerPokemonUtilityServices();
            
            
        //================================
        // Core Gameplay
        //================================
            
        this.registerEventServices();

        this.registerGameplayServices();
            
            
        //================================
        // Remaining Systems
        //================================

        this.registerPokemonInformationServices();

        this.registerActionServices();

        this.registerInventoryServices();

        this.registerStorageServices();

        this.registerCaptureServices();

        this.registerEncounterServices();

        this.registerStarterServices();

        this.registerNPCServices();

        this.registerTrainerAnalysisServices();

        this.registerSessionServices();

        this.registerWorldRuntimeServices();

        this.registerSaveServices();

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
        
            "moveDatabase",
        
            new MoveDatabaseService(
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



        const moveMachine =
            new MoveMachineService(
            
                this.game,
            
                this.get(
                    "moveDatabase"
                )
            
            );



        const moveReplacement =
            new MoveReplacementService();



        const moveLearning =
            new MoveLearningService(
            
                this.game,
            
                this.get(
                    "moveDatabase"
                ),
            
                this.get(
                    "moveReplacement"
                )
            
            );



        const statusEffect =
            new StatusEffectService();



        const pokemonSwitch =
            new PokemonSwitchService();






        this.container.register(

            "moveExecution",

            moveExecution

        );



        this.container.register(
        
            "moveMachine",
        
            moveMachine
        
        );



        this.container.register(
        
            "moveReplacement",
        
            moveReplacement
        
        );



        this.container.register(
        
            "moveLearning",
        
            moveLearning
        
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
    // Battle Active Layer
    //================================


    registerBattleActiveServices()
    {


        const battleActiveManager =
            new BattleActiveManager();




        const battleActiveFlow =
            new BattleActiveFlow(
            
                battleActiveManager,
            
            
                this.get(
                    "teamFlow"
                )
            
            );





        this.container.register(

            "battleActiveManager",

            battleActiveManager

        );





        this.container.register(

            "battleActiveFlow",

            battleActiveFlow

        );


    }






    //================================
    // Battle Opponent Layer
    //================================


    registerBattleOpponentServices()
    {


        const battleOpponentManager =
            new BattleOpponentManager();



        const battleOpponentFlow =
            new BattleOpponentFlow(

                battleOpponentManager

            );





        this.container.register(

            "battleOpponentManager",

            battleOpponentManager

        );





        this.container.register(

            "battleOpponentFlow",

            battleOpponentFlow

        );


    }






    //================================
    // Battle State Layer
    //================================


    registerBattleStateServices()
    {


        const battleStateManager =
            new BattleStateManager();




        const battleStateFlow =
            new BattleStateFlow(

                battleStateManager

            );





        this.container.register(

            "battleStateManager",

            battleStateManager

        );





        this.container.register(

            "battleStateFlow",

            battleStateFlow

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
            
                this.get(
                    "moveExecution"
                ),

                this.get(
                    "pokemonSwitch"
                ),

                this.get(
                    "battleStateFlow"
                ),
            
                this.get(
                    "battleActiveFlow"
                ),
            
                this.get(
                    "battleOpponentFlow"
                ),
            
                battleAI,
            
            );



        const battle =
            new BattleService(
            
                battlePreparation,
            
                battleEngine,
            
                this.get(
                    "pokemonProgression"
                ),
            
                this.get(
                    "experience"
                ),
            
                this.get(
                    "rewardService"
                )
            
            );



        const availability =
            new PokemonAvailabilityService(
            
                this.get(
                    "pokemonDatabase"
                ),
            
                this.get(
                    "locationDatabase"
                ),
            
                this.get(
                    "evolution"
                )
            
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


        const captureManager =
            new CaptureManager();



        const captureService =
            new CaptureService();



        const wildBattleService =
            new WildBattleService();





        const captureFlow =
            new CaptureFlow(

                captureService,
            
            
                captureManager,
            
            
                this.get(
                    "teamFlow"
                ),
            
            
                this.get(
                    "storageFlow"
                ),
            
            
                this.get(
                    "inventoryFlow"
                ),
            
            
                this.get(
                    "pokemonTracker"
                ),
            
            
                this.get(
                    "actionFlow"
                )
            
            );








        this.container.register(

            "captureManager",

            captureManager

        );





        this.container.register(

            "captureService",

            captureService

        );





        this.container.register(

            "wildBattleService",

            wildBattleService

        );





        this.container.register(

            "captureFlow",

            captureFlow

        );


    }





    //================================
    // Encounter Layer
    //================================


    registerEncounterServices()
    {


        const encounterManager =
            new EncounterManager();




        const encounterFlow =
            new EncounterFlow(

                encounterManager,


                this.get(
                    "locationDatabase"
                )

            );





        const encounterBattleFlow =
            new EncounterBattleFlow(

                encounterFlow,


                this.get(
                    "wildBattleService"
                )

            );








        this.container.register(

            "encounterManager",

            encounterManager

        );





        this.container.register(

            "encounterFlow",

            encounterFlow

        );





        this.container.register(

            "encounterBattleFlow",

            encounterBattleFlow

        );


    }





    //================================
    // Action Layer
    //================================
    
    
    registerActionServices()
    {
    
    
        const actionManager =
            new ActionManager();
    
    
    
    
        const actionFlow =
            new ActionFlow(
            
                actionManager
            
            );
        
        
        
        
        
        
        
        this.container.register(
        
            "actionManager",
        
            actionManager
        
        );
    
    
    
    
    
        this.container.register(
        
            "actionFlow",
        
            actionFlow
        
        );
    
    
    }





    //================================
    // Team Layer
    //================================


    registerTeamServices()
    {


        const teamManager =
            new TeamManager();




        const teamFlow =
            new TeamFlow(

                teamManager

            );







        this.container.register(

            "teamManager",

            teamManager

        );





        this.container.register(

            "teamFlow",

            teamFlow

        );


    }





    //================================
    // Active Pokémon Layer
    //================================
    
    
    registerActivePokemonServices()
    {
    
    
        const activePokemonManager =
            new ActivePokemonManager();
    
    
    
        const activePokemonFlow =
            new ActivePokemonFlow(
            
                activePokemonManager,
            
            
                this.get(
                    "teamFlow"
                )
            
            );
        
        
        
        
        
        this.container.register(
        
            "activePokemonManager",
        
            activePokemonManager
        
        );
    
    
    
    
    
        this.container.register(
        
            "activePokemonFlow",
        
            activePokemonFlow
        
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
    // Storage Layer
    //================================


    registerStorageServices()
    {


        const storageManager =
            new StorageManager();



        const storageFlow =
            new StorageFlow(
            
                storageManager,
            
                this.get(
                    "teamFlow"
                )
            
            );





        this.container.register(

            "storageManager",

            storageManager

        );





        this.container.register(

            "storageFlow",

            storageFlow

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
    // Pokémon Utility Layer
    //================================
    
    
    registerPokemonUtilityServices()
    {


        const evolution =
            new EvolutionService(

                this.get(
                    "pokemonDatabase"
                )

            );



        const growthRate =
            new GrowthRateService();



        const experience =
            new ExperienceService(
            
                this.get(
                    "growthRate"
                )
            
            );



        const levelUp =
            new LevelUpService();



        const evolutionRequirement =
            new EvolutionRequirementService();



        const pokemonProgression =
            new PokemonProgressionService(

                experience,

                levelUp,

                evolution

            );





        this.container.register(

            "evolutionRequirement",

            evolutionRequirement

        );



        this.container.register(

            "growthRate",

            growthRate

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

            "pokemonProgression",

            pokemonProgression

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
    // Session Layer
    //================================
    
    
    registerSessionServices()
    {
    
    
        const session =
            new GameSession(
                this.game
            );
        
        
        
        this.container.register(
        
            "session",
        
            session
        
        );
    
    
    }





    //================================
    // World Runtime Layer
    //================================


    registerWorldRuntimeServices()
    {


        const worldManager =
            new WorldManager(

                this.get(
                    "session"
                )

            );




        const worldFlow =
            new WorldFlow(

                worldManager,


                this.get(
                    "locationAccess"
                ),


                this.get(
                    "mapAccess"
                )

            );






        this.container.register(

            "worldManager",

            worldManager

        );





        this.container.register(

            "worldFlow",

            worldFlow

        );


    }





    //================================
    // Inventory Layer
    //================================
    
    
    registerInventoryServices()
    {
    
    
        const inventoryManager =
            new InventoryManager();
    
    
    
        const inventoryFlow =
            new InventoryFlow(
                inventoryManager
            );
        
        
        
        
        this.container.register(
        
            "inventoryManager",
        
            inventoryManager
        
        );
    
    
    
    
    
        this.container.register(
        
            "inventoryFlow",
        
            inventoryFlow
        
        );
    
    
    }





    //================================
    // Save Layer
    //================================


    registerSaveServices()
    {


        const saveManager =
            new SaveManager();



        this.container.register(

            "saveManager",

            saveManager

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