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


const fs =
    require("fs");

const path =
    require("path");


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

const ProgressionUnlockService =
    require("./services/progression-unlock-service");

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

const BattleRewardService =
    require("./services/battle-reward-service");

const BattleAIService =
    require("./services/battle-ai-service");

const BattleEngineService =
    require("./services/battle-engine-service");


//================================
// Battle Runtime Services
//================================

const BattleFlowService =
    require("./services/battle-flow-service");

const BattlePokemonService =
    require("./services/battle-pokemon-service");

const BattleValidationService =
    require("./services/battle-validation-service");

const BattleTurnOrderService =
    require("./services/battle-turn-order-service");

const BattleTurnService =
    require("./services/battle-turn-service");

const BattleFaintService =
    require("./services/battle-faint-service");

const BattleResultService =
    require("./services/battle-result-service");

const BattleStateService =
    require("./services/battle-state-service");

const BattleActiveFlow =
    require("./battle-active/battle-active-flow");

const BattleOpponentFlow =
    require("./battle-opponent/battle-opponent-flow");


//================================
// Pokémon Progression
//================================

const EvolutionService =
    require("./services/evolution-service");

const FriendshipService =
    require("./services/friendship-service");

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

const SafariCaptureService =
    require("./services/safari-capture-service");

const SafariZoneService =
    require("./services/safari-zone-service");

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


//================================
// NPC Services
//================================

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

const DamageCalculationService =
    require("./services/damage-calculation-service");

const MoveMachineService =
    require("./services/move-machine-service");

const MoveLearningService =
    require("./services/move-learning-service");

const MoveReplacementService =
    require("./services/move-replacement-service");

const MoveReplacementSelectionService =
    require("./services/move-replacement-selection-service");

const StatStageService =
    require("./services/stat-stage-service");

const StatCalculationService =
    require("./services/stat-calculation-service");

const PokemonStatProviderService =
    require("./services/pokemon-stat-provider-service");

const BattleSimulationService =
    require("./services/battle-simulation-service");

const BattlePredictionService =
    require("./services/battle-prediction-service");

const MoveForgetService =
    require("./services/move-forget-service");

const StatusEffectService =
    require("./services/status-effect-service");

const TypeEffectivenessService =
    require("./services/type-effectiveness-service");

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
// Inventory Services
//================================

const InventoryManager =
    require("./inventory/inventory-manager");

const InventoryFlow =
    require("./inventory/inventory-flow");

const ItemEffectService =
    require("./services/item-effect-service");


//================================
// Save Services
//================================

const SaveManager =
    require("./save/save-manager");


//================================
// Application Container
//================================

class AppContainer {


    constructor(
        game = "firered"
    )
    {

        this.container =
            new ServiceContainer();


        this.game =
            game;


        //================================
        // Base Data
        //================================

        this.registerDatabaseServices();


        //================================
        // Progression
        //================================

        this.registerProgressionServices();


        //================================
        // World
        //================================

        this.registerWorldServices();


        //================================
        // Gym
        //================================

        this.registerGymServices();


        //================================
        // Location
        //================================

        this.registerLocationServices();


        //================================
        // Battle Support
        //================================

        this.registerBattleSupportServices();


        //================================
        // Team
        //================================

        this.registerTeamServices();

        this.registerActivePokemonServices();


        //================================
        // Battle AI
        //================================

        this.registerBattleAIServices();


        //================================
        // Battle Runtime
        //================================

        this.registerBattleRuntimeServices();


        //================================
        // Pokémon Utility
        //================================

        this.registerPokemonUtilityServices();


        //================================
        // Pokémon Information
        //================================

        this.registerPokemonInformationServices();


        //================================
        // Event Services
        //================================
        //
        // Registered after Pokémon Information
        // because EventService depends on the
        // shared PokemonTrackerService.
        //
        //================================

        this.registerEventServices();


        //================================
        // Gameplay
        //================================

        this.registerGameplayServices();


        //================================
        // Remaining Systems
        //================================

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


        const progressionUnlock =
            new ProgressionUnlockService();
            
            
        const progression =
            new ProgressionService(
                this.game,
                progressionUnlock
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
            "progressionUnlock",
            progressionUnlock
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
                this.get(
                    "progression"
                )
            );


        const fieldObstacle =
            new FieldObstacleService(
                this.game,
                this.get(
                    "progression"
                )
            );


        const worldState =
            new WorldStateService(
                this.game
            );


        const worldProgression =
            new WorldProgressionService(
                this.get(
                    "storyProgression"
                ),
                this.get(
                    "gymProgression"
                ),
                this.get(
                    "progression"
                )
            );


        const objective =
            new ObjectiveService(
                this.get(
                    "storyProgression"
                ),
                this.get(
                    "gymProgression"
                ),
                this.get(
                    "progression"
                )
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
                ),

                this.get(
                    "progression"
                )

            );


        const gymEventService =
            new GymEventService(
                this.get(
                    "gymDatabase"
                )
            );


        const gym =
            new GymService(
                this.get(
                    "gymProgression"
                ),
                gymEventService,
                gymReward,
                this.get(
                    "trainerDatabase"
                )
            );


        this.container.register(
            "gymEventService",
            gymEventService
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
    // Battle Support Services
    //================================

    registerBattleSupportServices()
    {

        const typeEffectiveness =
            new TypeEffectivenessService();


        const statusEffect =
            new StatusEffectService();


        const damageCalculation =
            new DamageCalculationService(
                typeEffectiveness,
                statusEffect
            );


        const moveExecution =
            new MoveExecutionService(
                null,
                null,
                damageCalculation,
                statusEffect
            );


        const moveMachine =
            new MoveMachineService(
                this.game,
                this.get(
                    "moveDatabase"
                )
            );


        const moveReplacement =
            new MoveReplacementService();


        const moveForget =
            new MoveForgetService();


        const moveReplacementSelection =
            new MoveReplacementSelectionService();


        const moveLearning =
            new MoveLearningService(
                this.game,
                this.get(
                    "moveDatabase"
                ),
                moveReplacement,
                moveReplacementSelection,
                moveForget
            );


        const statStage =
            new StatStageService();


        const statCalculation =
            new StatCalculationService(
                statStage,
                null
            );


        const pokemonStatProvider =
            new PokemonStatProviderService(
                statCalculation
            );


        const battleSimulation =
            new BattleSimulationService(
                pokemonStatProvider,
                typeEffectiveness
            );


        this.container.register(
            "moveExecution",
            moveExecution
        );


        this.container.register(
            "damageCalculation",
            damageCalculation
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
            "moveForget",
            moveForget
        );


        this.container.register(
            "moveReplacementSelection",
            moveReplacementSelection
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
            "statStage",
            statStage
        );


        this.container.register(
            "statCalculation",
            statCalculation
        );


        this.container.register(
            "pokemonStatProvider",
            pokemonStatProvider
        );


        this.container.register(
            "battleSimulation",
            battleSimulation
        );

    }


    //================================
    // Battle AI Layer
    //================================

    registerBattleAIServices()
    {

        const battleAI =
            new BattleAIService();


        this.container.register(
            "battleAI",
            battleAI
        );

    }


    //================================
    // Battle Runtime Layer
    //================================

    registerBattleRuntimeServices()
    {

        //--------------------------------
        // Validation
        //--------------------------------

        const validation =
            new BattleValidationService();


        //--------------------------------
        // Pokémon utilities
        //--------------------------------

        const pokemon =
            new BattlePokemonService();


        //--------------------------------
        // Turn order
        //--------------------------------

        const turnOrder =
            new BattleTurnOrderService(

                pokemon

            );


        //--------------------------------
        // Turn execution
        //--------------------------------

        const turn =
            new BattleTurnService(

                this.get(
                    "moveExecution"
                ),

                this.get(
                    "statusEffect"
                ),

                null,

                pokemon

            );


        //--------------------------------
        // Pokémon switching
        //--------------------------------

        const pokemonSwitch =
            new PokemonSwitchService(

                pokemon

            );


        //--------------------------------
        // Battle result
        //--------------------------------

        const result =
            new BattleResultService();


        //--------------------------------
        // Faint handling
        //--------------------------------

        const faint =
            new BattleFaintService(
                pokemon,
                pokemonSwitch,
                this.get(
                    "friendship"
                )
            );


        //--------------------------------
        // Battle flow
        //--------------------------------

        const flow =
            new BattleFlowService(

                validation,

                turnOrder,

                turn,

                faint,

                result,

                pokemon,

                this.get(
                    "battleAI"
                )

            );


        //--------------------------------
        // Register runtime services
        //--------------------------------

        this.container.register(
            "battleValidation",
            validation
        );


        this.container.register(
            "battleTurnOrder",
            turnOrder
        );


        this.container.register(
            "battleTurn",
            turn
        );


        this.container.register(
            "battlePokemon",
            pokemon
        );


        this.container.register(
            "pokemonSwitch",
            pokemonSwitch
        );


        this.container.register(
            "battleFaint",
            faint
        );


        this.container.register(
            "battleResult",
            result
        );


        this.container.register(
            "battleFlow",
            flow
        );

    }


    //================================
    // Pokémon Utility Layer
    //================================

    registerPokemonUtilityServices()
    {

        //--------------------------------
        // Friendship
        //--------------------------------

        const friendship =
            new FriendshipService();


        //--------------------------------
        // Evolution
        //--------------------------------

        const evolution =
            new EvolutionService(
                this.get(
                    "pokemonDatabase"
                ),
                friendship
            );


        //--------------------------------
        // Growth rate
        //--------------------------------

        const growthRate =
            new GrowthRateService();


        //--------------------------------
        // Experience
        //--------------------------------

        const experience =
            new ExperienceService(
                growthRate
            );


        //--------------------------------
        // Level up
        //--------------------------------

        const levelUp =
            new LevelUpService();


        //--------------------------------
        // Evolution requirement
        //--------------------------------

        const evolutionRequirement =
            new EvolutionRequirementService();


        //--------------------------------
        // Pokémon progression
        //--------------------------------

        const pokemonProgression =
            new PokemonProgressionService(
                experience,
                levelUp,
                evolution,
                friendship
            );


        //--------------------------------
        // Register
        //--------------------------------

        this.container.register(
            "evolutionRequirement",
            evolutionRequirement
        );


        this.container.register(
            "friendship",
            friendship
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
    // Event Layer
    //================================

    registerEventServices()
    {

        //--------------------------------
        // Reward service
        //--------------------------------

        const rewardService =
            new RewardService(
                this.get(
                    "pokemonDatabase"
                )
            );


        //--------------------------------
        // Event reward service
        //--------------------------------

        const eventRewardService =
            new EventRewardService();


        //--------------------------------
        // Event service
        //--------------------------------

        const eventService =
            new EventService(
                this.game,
                this.get(
                    "progression"
                ),
                this.get(
                    "pokemonTracker"
                )
            );


        //--------------------------------
        // Story event service
        //--------------------------------

        const storyEventService =
            new StoryEventService(
                this.game
            );


        //--------------------------------
        // Register
        //--------------------------------

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


    //================================
    // Gameplay Layer
    //================================

    registerGameplayServices()
    {

        //--------------------------------
        // Trainer
        //--------------------------------

        const trainer =
            new TrainerService(
                this.get(
                    "trainerDatabase"
                )
            );


        //--------------------------------
        // Battle preparation
        //--------------------------------

        const battlePreparation =
            new BattlePreparationService(
                trainer,
                this.get(
                    "pokemonDatabase"
                ),
                this.get(
                    "statCalculation"
                ),
                this.get(
                    "pokemonStatProvider"
                ),
                this.get(
                    "moveDatabase"
                )
            );


        //--------------------------------
        // Battle reward
        //--------------------------------

        const battleReward =
            new BattleRewardService(
                this.get(
                    "experience"
                ),
                this.get(
                    "levelUp"
                ),
                this.get(
                    "evolution"
                ),
                this.get(
                    "friendship"
                ),
                this.get(
                    "rewardService"
                )
            );


        //--------------------------------
        // Battle engine
        //--------------------------------

        const battleEngine =
            new BattleEngineService(
                this.get(
                    "battleFlow"
                ),
                this.get(
                    "battlePokemon"
                )
            );


        //--------------------------------
        // Battle service
        //--------------------------------

        const battle =
            new BattleService(
                battlePreparation,
                battleEngine,
                battleReward
            );


        //--------------------------------
        // Register battle first
        //
        // Battle state must reference the
        // actual authoritative BattleService.
        //--------------------------------

        this.container.register(
            "trainerService",
            trainer
        );


        this.container.register(
            "battlePreparation",
            battlePreparation
        );


        this.container.register(
            "battleReward",
            battleReward
        );


        this.container.register(
            "battleEngine",
            battleEngine
        );


        this.container.register(
            "battle",
            battle
        );


        //--------------------------------
        // Battle state access
        //--------------------------------

        const battleState =
            new BattleStateService(
                battle
            );


        //--------------------------------
        // Active Pokémon flow
        //--------------------------------

        const battleActive =
            new BattleActiveFlow(
                battleState,
                this.get(
                    "pokemonSwitch"
                )
            );


        //--------------------------------
        // Opponent flow
        //--------------------------------

        const battleOpponent =
            new BattleOpponentFlow(
                battleState
            );


        //--------------------------------
        // Register battle state services
        //--------------------------------

        this.container.register(
            "battleState",
            battleState
        );


        this.container.register(
            "battleActive",
            battleActive
        );


        this.container.register(
            "battleOpponent",
            battleOpponent
        );


        //--------------------------------
        // Battle prediction
        //--------------------------------

        const battlePrediction =
            new BattlePredictionService(
                this.get(
                    "battleSimulation"
                ),
                battlePreparation
            );


        //--------------------------------
        // Pokémon availability
        //--------------------------------

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


        //--------------------------------
        // Pokémon obtainability
        //--------------------------------

        const obtainability =
            new PokemonObtainabilityService(
                availability
            );


        //--------------------------------
        // Team recommendation
        //--------------------------------

        const recommendation =
            new TeamRecommendationService(
                availability
            );


        //--------------------------------
        // Register remaining gameplay services
        //--------------------------------

        this.container.register(
            "battlePrediction",
            battlePrediction
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
    // Capture Layer
    //================================

    registerCaptureServices()
    {

        //--------------------------------
        // Load capture reference
        //--------------------------------

        const captureReferencePath =
            path.join(
                __dirname,
                "..",
                "database",
                "reference",
                this.game,
                "capture.json"
            );


        if(
            !fs.existsSync(
                captureReferencePath
            )
        )
        {

            throw new Error(
                `Capture reference database not found: ${captureReferencePath}`
            );

        }


        const captureReference =
            JSON.parse(
                fs.readFileSync(
                    captureReferencePath,
                    "utf8"
                )
            );


        //--------------------------------
        // Capture manager
        //--------------------------------

        const captureManager =
            new CaptureManager();


        //--------------------------------
        // Normal capture
        //--------------------------------

        const captureService =
            new CaptureService(
                captureReference
            );


        //--------------------------------
        // Safari capture
        //--------------------------------

        const safariCaptureService =
            new SafariCaptureService(
                captureReference
            );


        //--------------------------------
        // Safari Zone
        //--------------------------------

        const safariZoneService =
            new SafariZoneService();


        //--------------------------------
        // Wild battle
        //--------------------------------

        const wildBattleService =
            new WildBattleService();


        //--------------------------------
        // Capture flow
        //--------------------------------

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
                ),
                this.get(
                    "pokemonDatabase"
                ),
                this.get(
                    "friendship"
                )
            );


        //--------------------------------
        // Register services
        //--------------------------------

        this.container.register(
            "captureManager",
            captureManager
        );


        this.container.register(
            "captureService",
            captureService
        );


        this.container.register(
            "safariCaptureService",
            safariCaptureService
        );


        this.container.register(
            "safariZoneService",
            safariZoneService
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
                ),
                this.get(
                    "teamFlow"
                ),
                this.get(
                    "friendship"
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

        //--------------------------------
        // Inventory manager
        //--------------------------------

        const inventoryManager =
            new InventoryManager();


        //--------------------------------
        // Load Gen III item behavior database
        //--------------------------------

        const itemBehaviorPath =
            path.join(
                __dirname,
                "..",
                "database",
                "reference",
                "gen3-item-behaviors.json"
            );


        if(
            !fs.existsSync(
                itemBehaviorPath
            )
        )
        {

            throw new Error(
                `Gen III item behavior database not found: ${itemBehaviorPath}`
            );

        }


        const itemBehaviors =
            JSON.parse(
                fs.readFileSync(
                    itemBehaviorPath,
                    "utf8"
                )
            );


        //--------------------------------
        // Item effect service
        //--------------------------------

        const itemEffect =
            new ItemEffectService(
                this.get(
                    "statusEffect"
                ),
                this.get(
                    "friendship"
                ),
                this.get(
                    "statStage"
                )
            );


        //--------------------------------
        // Inventory flow
        //--------------------------------

        const inventoryFlow =
            new InventoryFlow(
                inventoryManager,
                itemEffect,
                itemBehaviors
            );


        //--------------------------------
        // Register
        //--------------------------------

        this.container.register(
            "inventoryManager",
            inventoryManager
        );


        this.container.register(
            "itemEffect",
            itemEffect
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

        return this.container.getContainer
            ? 
            this.container.getContainer()
            :
            this.container;

    }


}


module.exports =
    AppContainer;