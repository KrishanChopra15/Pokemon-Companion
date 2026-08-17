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




//----------------------------------------
// Extractors
//----------------------------------------

const PokemonEncounterExtractor =
    require("../extractors/game-boy-advance/pokemon-encounter-extractor");


const LocationExtractor =
    require("../extractors/game-boy-advance/location-extractor");


const LocationGraphExtractor =
    require("../extractors/game-boy-advance/location-graph-extractor");


const LocationGateExtractor =
    require("../extractors/game-boy-advance/location-gate-extractor");


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






//----------------------------------------
// Generators
//----------------------------------------

const LocationGraphGenerator =
    require("../generators/raw/location-graph-generator");


const LocationGateGenerator =
    require("../generators/raw/location-gate-generator");


const FieldObstacleGenerator =
    require("../generators/raw/field-obstacle-generator");


const EventGenerator =
    require("../generators/raw/event-generator");


const DialogueGenerator =
    require("../generators/raw/dialogue-generator");


const NPCDialogueGenerator =
    require("../generators/raw/npc-dialogue-generator");





//----------------------------------------
// Builders
//----------------------------------------

const BuildManager =
    require("../builders/build-manager");









class FireRedBuildPipeline {



    run()
    {


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







        //----------------------------------------
        // Configuration
        //----------------------------------------

        console.log(
            "Loading configuration..."
        );


        const config =
            ConfigManager.load();







        //----------------------------------------
        // Discover ROM
        //----------------------------------------

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








        //----------------------------------------
        // Open ROM
        //----------------------------------------

        console.log(
            "Opening ROM..."
        );


        const reader =
            ReaderFactory.create(
                source
            );


        reader.open();







        //----------------------------------------
        // Extract game
        //----------------------------------------

        console.log(
            "Extracting game..."
        );


        const extractor =
            ExtractorFactory.create(
                reader
            );


        extractor.extractGame();








        //----------------------------------------
        // Pokémon
        //----------------------------------------

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








        //----------------------------------------
        // Encounters
        //----------------------------------------

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








        //----------------------------------------
        // Reference path
        //----------------------------------------

        const referencePath =
            path.resolve(
                __dirname,
                "../../../References/pokefirered"
            );








        //----------------------------------------
        // Locations
        //----------------------------------------

        console.log(
            "Extracting locations..."
        );


        const locations =
            new LocationExtractor()
                .extract(
                    referencePath
                );








        //----------------------------------------
        // Location graph
        //----------------------------------------

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








        //----------------------------------------
        // Gates
        //----------------------------------------

        console.log(
            "Extracting location gates..."
        );


        const locationGates =
            new LocationGateExtractor()
                .extract(
                    referencePath
                );








        //----------------------------------------
        // Obstacles
        //----------------------------------------

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








        //----------------------------------------
        // NPC Events
        //----------------------------------------

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








        //----------------------------------------
        // Dialogues
        //----------------------------------------

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








        //----------------------------------------
        // Event scripts
        //----------------------------------------

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








        //----------------------------------------
        // Object events
        //----------------------------------------

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








        //----------------------------------------
        // Generate raw databases
        //----------------------------------------

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
                locationGates,
                "firered"
            );



        new FieldObstacleGenerator()
            .generate(
                fieldObstacles,
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



        new NPCDialogueGenerator()
            .generate(
                events,
                dialogues,
                npcs,
                objects,
                "firered"
            );








        //----------------------------------------
        // Build databases
        //----------------------------------------

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

                dialogues,

                events,


                //----------------------------------------
                // Pokemon availability data
                //----------------------------------------

                availability:
                {

                    encounters,

                    locations

                }

            }
        );








        //----------------------------------------
        // Close ROM
        //----------------------------------------

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