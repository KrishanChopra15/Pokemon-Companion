/**
 * Pokémon Companion
 * FireRed Build Pipeline
 *
 * Complete build pipeline for Pokémon FireRed.
 *
 * Responsibilities:
 * - Discover ROM
 * - Read ROM
 * - Extract Pokémon data
 * - Extract source encounter data
 * - Extract location data
 * - Extract NPC data
 * - Extract map scripts
 * - Extract coordinate events
 * - Extract background events
 * - Extract movement scripts
 * - Extract events
 * - Generate raw databases
 * - Delegate database building to BuildManager
 *
 * Does NOT:
 * - Build generated databases directly.
 * - Build progression directly.
 * - Handle application services.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



const ConfigManager =
    require("../shared/config/config-manager");


const SourceManager =
    require("../shared/source-manager/source-manager");


const ReaderFactory =
    require("../readers/reader-factory");


const ExtractorFactory =
    require("../extractors/extractor-factory");



//========================================
// Extractors
//========================================

const PokemonEncounterExtractor =
    require("../extractors/game-boy-advance/pokemon-encounter-extractor");


const LocationExtractor =
    require("../extractors/game-boy-advance/location-extractor");


const LocationGraphExtractor =
    require("../extractors/game-boy-advance/location-graph-extractor");


const LocationGateExtractor =
    require("../extractors/game-boy-advance/location-gate-extractor");


const FireRedSourceGateExtractor =
    require("../extractors/game-boy-advance/firered-source-gate-extractor");


const FieldObstacleExtractor =
    require("../extractors/game-boy-advance/field-obstacle-extractor");


const NPCEventExtractor =
    require("../extractors/game-boy-advance/npc-event-extractor");


const DialogueExtractor =
    require("../extractors/game-boy-advance/dialogue-extractor");


const EventScriptExtractor =
    require("../extractors/game-boy-advance/event-script-extractor");


const ObjectEventExtractor =
    require("../extractors/game-boy-advance/object-event-extractor");


const MapScriptExtractor =
    require("../extractors/game-boy-advance/map-script-extractor");


const CoordinateEventExtractor =
    require("../extractors/game-boy-advance/coordinate-event-extractor");


const BackgroundEventExtractor =
    require("../extractors/game-boy-advance/background-event-extractor");


const MovementScriptExtractor =
    require("../extractors/game-boy-advance/movement-script-extractor");


const TerrainExtractor =
    require("../extractors/game-boy-advance/terrain-extractor");



//========================================
// Generators
//========================================

const LocationGraphGenerator =
    require("../generators/raw/location-graph-generator");


const LocationGateGenerator =
    require("../generators/raw/location-gate-generator");


const SourceLocationGateGenerator =
    require("../generators/raw/source-location-gate-generator");


const SourceEventGenerator =
    require("../generators/raw/source-event-generator");


const FieldObstacleGenerator =
    require("../generators/raw/field-obstacle-generator");


const EventGenerator =
    require("../generators/raw/event-generator");


const DialogueGenerator =
    require("../generators/raw/dialogue-generator");


const NPCDialogueGenerator =
    require("../generators/raw/npc-dialogue-generator");


const TerrainGenerator =
    require("../generators/raw/terrain-generator");



//========================================
// Builders
//========================================

const BuildManager =
    require("../builders/build-manager");


const LocationGateMerger =
    require("../builders/location-gate-merger");





class FireRedBuildPipeline
{


    run()
    {


        //========================================
        // Header
        //========================================

        console.log();


        console.log(
            "========================================"
        );


        console.log(
            "Pokémon FireRed Build Pipeline"
        );


        console.log(
            "========================================"
        );


        console.log();


        //========================================
        // Configuration
        //========================================

        console.log(
            "Loading configuration..."
        );


        const config =
            ConfigManager.load();


        //========================================
        // Discover ROM
        //========================================

        console.log(
            "Discovering sources..."
        );


        const sourceManager =
            new SourceManager(

                config.sourcesDirectory

            );


        const sources =
            sourceManager.discover();


        const source =
            sources[0];


        //========================================
        // Open ROM
        //========================================

        console.log(
            "Opening ROM..."
        );


        const reader =
            ReaderFactory.create(

                source

            );


        reader.open();


        //========================================
        // Extract game
        //========================================

        console.log(
            "Extracting game..."
        );


        const extractor =
            ExtractorFactory.create(

                reader

            );


        extractor.extractGame();


        //========================================
        // Pokémon
        //========================================

        console.log(
            "Extracting Pokémon species..."
        );


        const species =
            extractor.extractPokemonSpecies();


        console.log(
            "Extracting Pokémon moves..."
        );


        const moves =
            extractor.extractMoves();


        //========================================
        // Encounters
        //========================================

        console.log(
            "Extracting Pokémon encounters..."
        );


        const encounterFile =
            path.resolve(

                __dirname,

                "../../../References/pokefirered/src/data/wild_encounters.json"

            );


        const encounterData =
            JSON.parse(

                fs.readFileSync(

                    encounterFile,

                    "utf8"

                )

            );


        const encounters =
            new PokemonEncounterExtractor()
                .extract(

                    encounterData

                );


        //========================================
        // Reference path
        //========================================

        const referencePath =
            path.resolve(

                __dirname,

                "../../../References/pokefirered"

            );


        //========================================
        // Locations
        //========================================

        console.log(
            "Extracting locations..."
        );


        const locations =
            new LocationExtractor()
                .extract(

                    referencePath

                );


        //========================================
        // Location graph
        //========================================

        console.log(
            "Extracting location graph..."
        );


        const locationGraph =
            new LocationGraphExtractor()
                .extract(

                    referencePath

                );


        console.log(
            `Location graph nodes: ${Object.keys(locationGraph).length}`
        );


        //========================================
        // Gates
        //========================================

        console.log(
            "Extracting location gates..."
        );


        const locationGates =
            new LocationGateExtractor()
                .extract(

                    referencePath

                );
        
        
        console.log(
            "Extracting source-derived FireRed location gates..."
        );


        const sourceLocationGates =
            new FireRedSourceGateExtractor()
                .extract(
                    referencePath
                );


        console.log(
            `Source-derived location gate locations: ${Object.keys(sourceLocationGates).length}`
        );


        //========================================
        // Merge location gates
        //========================================

        const mergedLocationGates =
            new LocationGateMerger()
                .merge(
                    locationGates,
                    sourceLocationGates
                );



        //========================================
        // Field obstacles
        //========================================

        console.log(
            "Extracting field obstacles..."
        );


        const fieldObstacles =
            new FieldObstacleExtractor()
                .extract(
                
                    referencePath
                
                );
            
            
        console.log(
            `Field obstacle locations: ${Object.keys(fieldObstacles).length}`
        );


        //========================================
        // Terrain
        //========================================

        console.log(
            "Extracting terrain..."
        );


        const terrain =
            new TerrainExtractor()
                .extract(
                
                    referencePath
                
                );
            
            
        console.log(
            `Terrain locations: ${Object.keys(terrain).length}`
        );


        //========================================
        // NPC Events
        //========================================

        console.log(
            "Extracting NPC events..."
        );


        const npcs =
            new NPCEventExtractor()
                .extract(

                    referencePath

                );


        console.log(
            `NPC locations: ${Object.keys(npcs).length}`
        );


        //========================================
        // Dialogues
        //========================================

        console.log(
            "Extracting dialogues..."
        );


        const dialogues =
            new DialogueExtractor()
                .extract(

                    referencePath

                );


        console.log(
            `Dialogues: ${Object.keys(dialogues).length}`
        );


        //========================================
        // Event scripts
        //========================================

        console.log(
            "Extracting event scripts..."
        );


        const events =
            new EventScriptExtractor()
                .extract(

                    referencePath

                );


        console.log(
            `Event scripts: ${Object.keys(events).length}`
        );


        //========================================
        // Object events
        //========================================

        console.log(
            "Extracting object events..."
        );


        const objects =
            new ObjectEventExtractor()
                .extract(

                    referencePath

                );


        console.log(
            `Object events: ${objects.length}`
        );


        //========================================
        // Map scripts
        //========================================

        console.log(
            "Extracting map scripts..."
        );


        const mapScripts =
            new MapScriptExtractor()
                .extract(

                    referencePath

                );


        console.log(
            `Maps with map scripts: ${Object.keys(mapScripts).length}`
        );


        //========================================
        // Coordinate events
        //========================================

        console.log(
            "Extracting coordinate events..."
        );


        const coordinateEvents =
            new CoordinateEventExtractor()
                .extract(

                    referencePath

                );


        const coordinateEventCount =
            Object.values(

                coordinateEvents

            )
            .reduce(

                (
                    total,
                    mapEvents
                ) =>

                    total +
                    mapEvents.length,

                0

            );


        console.log(
            `Maps with coordinate events: ${Object.keys(coordinateEvents).length}`
        );


        console.log(
            `Coordinate events: ${coordinateEventCount}`
        );


        //========================================
        // Background events
        //========================================

        console.log(
            "Extracting background events..."
        );


        const backgroundEvents =
            new BackgroundEventExtractor()
                .extract(

                    referencePath

                );


        const backgroundSignCount =
            backgroundEvents.filter(

                event =>

                    event.eventType ===
                    "BG_SIGN_EVENT"

            )
            .length;


        const backgroundHiddenItemCount =
            backgroundEvents.filter(

                event =>

                    event.eventType ===
                    "BG_HIDDEN_ITEM_EVENT"

            )
            .length;


        console.log(
            `Background events: ${backgroundEvents.length}`
        );


        console.log(
            `Background sign events: ${backgroundSignCount}`
        );


        console.log(
            `Background hidden item events: ${backgroundHiddenItemCount}`
        );


        //========================================
        // Movement scripts
        //========================================

        console.log(
            "Extracting movement scripts..."
        );


        const movementScripts =
            new MovementScriptExtractor()
                .extract(

                    referencePath

                );


        console.log(
            `Movement definitions: ${Object.keys(movementScripts).length}`
        );


        const movementCommandCount =
            Object.values(
                movementScripts
            )
            .reduce(

                (
                    total,
                    movement
                ) =>

                    total +
                    (
                        movement.commands?.length
                        ||
                        0
                    ),

                0

            );


        console.log(
            `Movement commands: ${movementCommandCount}`
        );


        //========================================
        // Generate raw databases
        //========================================

        console.log(
            "Generating raw databases..."
        );


        new LocationGraphGenerator()
            .generate(

                locationGraph,

                "firered"

            );


        new LocationGateGenerator()
            .generate(

                mergedLocationGates,

                "firered"

            );
        
        
        new SourceLocationGateGenerator()
            .generate(

                sourceLocationGates,

                "firered"

            );


        new SourceEventGenerator()
            .generate(

                events,

                "firered"

            );



        new FieldObstacleGenerator()
            .generate(

                fieldObstacles,

                "firered"

            );


        new TerrainGenerator()
            .generate(
                terrain,
                "firered"
            );


        new EventGenerator()
            .generate(

                events,

                npcs,

                objects,

                "firered"

            );


        new DialogueGenerator()
            .generate(

                dialogues,

                "firered"

            );


        //========================================
        // NPC dialogue database
        //========================================

        new NPCDialogueGenerator()
            .generate(

                events,

                dialogues,

                npcs,

                objects,

                "firered"

            );


        //========================================
        // Build databases
        //========================================

        console.log(
            "Building databases..."
        );


        const buildManager =
            new BuildManager();


        buildManager.buildGame(

            "firered",

            {

                species,

                moves,

                encounters,

                locations,

                npcs,

                objects,

                mapScripts,

                coordinateEvents,

                backgroundEvents,

                movementScripts,

                dialogues,

                events,

                //================================
                // Pokémon availability data
                //================================

                availability:
                {

                    encounters,

                    locations

                }

            }

        );


        //========================================
        // Close ROM
        //========================================

        reader.close();


        console.log();


        console.log(
            "========================================"
        );


        console.log(
            "FireRed build completed successfully."
        );


        console.log(
            "========================================"
        );

    }


}



module.exports =
    FireRedBuildPipeline;