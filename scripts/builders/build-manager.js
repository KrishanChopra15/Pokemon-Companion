/**
 * Pokémon Companion
 * Build Manager
 *
 * Coordinates generators and builders for a game.
 *
 * Responsibilities:
 * - Generate raw Pokémon databases.
 * - Generate gym databases.
 * - Generate progression databases.
 * - Generate reference databases.
 * - Generate movement databases.
 * - Build generated databases.
 * - Build trainer database.
 * - Build NPC database from events and trainers.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract ROM data.
 * - Parse binary data.
 * - Execute application services.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


//========================================
// Raw Generators
//========================================

const PokemonSpeciesGenerator =
    require("../generators/raw/pokemon-species-generator");


const PokemonMoveGenerator =
    require("../generators/raw/pokemon-move-generator");


const PokemonEvolutionGenerator =
    require("../generators/raw/pokemon-evolution-generator");


const PokemonLearnsetGenerator =
    require("../generators/raw/pokemon-learnset-generator");


const PokemonEncounterGenerator =
    require("../generators/raw/pokemon-encounter-generator");


const PokemonAvailabilityGenerator =
    require("../generators/raw/pokemon-availability-generator");


const PokemonMachineGenerator =
    require("../generators/raw/pokemon-machine-generator");


const PokemonEggMoveGenerator =
    require("../generators/raw/pokemon-egg-move-generator");


const TrainerGenerator =
    require("../generators/raw/trainer-generator");


const TrainerPartyGenerator =
    require("../generators/raw/trainer-party-generator");


const LocationGenerator =
    require("../generators/raw/location-generator");


const ProgressionGenerator =
    require("../generators/raw/progression-generator");


const GymGenerator =
    require("../generators/raw/gym-generator");


const BackgroundEventGenerator =
    require("../generators/raw/background-event-generator");


const MovementScriptGenerator =
    require("../generators/raw/movement-script-generator");


//========================================
// Reference Generators
//========================================

const SpeciesNameGenerator =
    require("../generators/reference/species-name-generator");


const TypeGenerator =
    require("../generators/reference/type-generator");


const AbilityGenerator =
    require("../generators/reference/ability-generator");


const GrowthRateGenerator =
    require("../generators/reference/growth-rate-generator");


const MoveNameGenerator =
    require("../generators/reference/move-name-generator");


const EggGroupGenerator =
    require("../generators/reference/egg-group-generator");


const BodyColorGenerator =
    require("../generators/reference/body-color-generator");


const ItemGenerator =
    require("../generators/reference/item-generator");


const ItemEffectGenerator =
    require("../generators/reference/item-effect-generator");


const Gen3ItemBehaviorGenerator =
    require("../generators/reference/gen3-item-behavior-generator");


const EvolutionMethodGenerator =
    require("../generators/reference/evolution-method-generator");


const MachineGenerator =
    require("../generators/reference/machine-generator");


const MoveEffectGenerator =
    require("../generators/reference/move-effects-generator");


const MoveTargetGenerator =
    require("../generators/reference/move-targets-generator");


const PokedexGenerator =
    require("../generators/reference/pokedex-generator");


const PickupGenerator =
    require("../generators/reference/pickup-generator");


const CaptureGenerator =
    require("../generators/reference/capture-generator");


//========================================
// Generated Generators
//========================================

const MoveLearnerGenerator =
    require("../generators/generated/move-learner-generator");


const StoryEventMapGenerator =
    require("../generators/generated/story-event-map-generator");


//========================================
// NPC Generator
//========================================

const NPCEventGenerator =
    require("../generators/raw/npc-event-generator");


//========================================
// Rules
//========================================

const ProgressionRules =
{
    firered:
        require("../rules/firered")
};


const WorldGates =
{
    firered:
        require("../rules/firered/world-gates")
};


const GymRules =
{
    firered:
        require("../rules/firered-gym-rules")
};


const EventMappings =
{
    firered:
        require("../rules/firered-event-mappings")
};


//========================================
// Builders
//========================================

const PokemonSpeciesBuilder =
    require("./pokemon-species-builder");


const PokemonMoveBuilder =
    require("./pokemon-move-builder");


const PokemonEncounterBuilder =
    require("./pokemon-encounter-builder");


const PokemonAvailabilityBuilder =
    require("./pokemon-availability-builder");


const MoveLearnerBuilder =
    require("./move-learner-builder");


const TrainerBuilder =
    require("./trainer-builder");


const LocationBuilder =
    require("./location-builder");


const DialogueBuilder =
    require("./dialogue-builder");


const ProgressionBuilder =
    require("./progression-builder");


const GymBuilder =
    require("./gym-builder");


//========================================
// Build Manager
//========================================

class BuildManager
{


    constructor()
    {

        this.built =
        {

            progression:
                false,

            gyms:
                false

        };

    }


    //========================================
    // Build Game
    //========================================

    buildGame(
        game,
        data = {}
    )
    {

        console.log();


        console.log(
            "========================================"
        );


        console.log(
            "Build Manager"
        );


        console.log(
            "========================================"
        );


        //========================================
        // Raw Databases
        //========================================

        console.log(
            "Generating raw databases..."
        );


        if(
            data.species
        )
        {

            new PokemonSpeciesGenerator()
                .generate(

                    data.species

                );

        }


        if(
            data.moves
        )
        {

            new PokemonMoveGenerator()
                .generate(

                    data.moves

                );

        }


        new PokemonEvolutionGenerator()
            .generate(

                game

            );


        new PokemonLearnsetGenerator()
            .generate(

                game

            );


        if(
            data.encounters
        )
        {

            new PokemonEncounterGenerator()
                .generate(

                    data.encounters,

                    game

                );

        }


        new PokemonMachineGenerator()
            .generate(

                game

            );


        new PokemonEggMoveGenerator()
            .generate(

                game

            );


        new TrainerGenerator()
            .generate(

                game

            );


        new TrainerPartyGenerator()
            .generate(

                game

            );


        if(
            data.locations
        )
        {

            new LocationGenerator()
                .generate(

                    data.locations

                );

        }


        //========================================
        // Background Event Database
        //========================================

        if(
            data.backgroundEvents
        )
        {

            console.log(
                "Generating background event database..."
            );


            new BackgroundEventGenerator()
                .generate(

                    data.backgroundEvents,

                    game

                );

        }


        //========================================
        // Movement Script Database
        //========================================

        if(
            data.movementScripts
        )
        {

            console.log(
                "Generating movement script database..."
            );


            new MovementScriptGenerator()
                .generate(

                    data.movementScripts,

                    game

                );

        }


        //========================================
        // Gym Database
        //========================================

        const gyms =
            GymRules[game];


        if(
            gyms
            &&
            !this.built.gyms
        )
        {

            console.log(
                "Generating gym database..."
            );


            new GymGenerator()
                .generate(

                    gyms,

                    game

                );

        }


        //========================================
        // Progression Database
        //========================================

        const rules =
            ProgressionRules[game];


        const worldGates =
            WorldGates[game];


        if(
            (
                rules
                ||
                worldGates
            )
            &&
            !this.built.progression
        )
        {

            console.log(
                "Generating progression database..."
            );


            //----------------------------------------
            // World gates are authoritative for
            // access rules when their IDs overlap
            // with general progression rules.
            //----------------------------------------

            const worldGateIds =
                new Set(

                    Array.isArray(worldGates)
                        ?
                        worldGates
                            .map(

                                rule =>

                                    rule
                                    &&
                                    rule.id
                                        ?
                                        rule.id
                                        :
                                        null

                            )
                            .filter(

                                Boolean

                            )
                        :
                        []

                );


            const baseRules =
                Array.isArray(rules)
                    ?
                    rules.filter(

                        rule =>

                            !rule
                            ||
                            !worldGateIds.has(
                                rule.id
                            )

                    )
                    :
                    [];


            const progressionRules =
            [

                ...(Array.isArray(worldGates)
                    ?
                    worldGates
                    :
                    []),

                ...baseRules

            ];


            new ProgressionGenerator()
                .generate(

                    progressionRules,

                    game

                );

        }


        //========================================
        // Reference Databases
        //========================================

        console.log(
            "Generating reference databases..."
        );


        new SpeciesNameGenerator()
            .generate();


        new PokedexGenerator(
            game
        )
            .generate();


        new PickupGenerator(
            game
        )
            .generate();


        new CaptureGenerator()
            .generate();


        new MoveNameGenerator()
            .generate();


        new TypeGenerator()
            .generate();


        new AbilityGenerator()
            .generate();


        new GrowthRateGenerator()
            .generate();


        new EggGroupGenerator()
            .generate();


        new BodyColorGenerator()
            .generate();


        new ItemGenerator()
            .generate();


        new ItemEffectGenerator()
            .generate();


        new Gen3ItemBehaviorGenerator()
            .generate();


        new EvolutionMethodGenerator()
            .generate();


        new MachineGenerator()
            .generate();


        new MoveEffectGenerator()
            .generate();


        new MoveTargetGenerator()
            .generate();


        //========================================
        // Generated Databases
        //========================================

        console.log(
            "Building generated databases..."
        );


        if(
            data.species
        )
        {

            new PokemonSpeciesBuilder()
                .build(

                    game

                );

        }


        if(
            data.moves
        )
        {

            new PokemonMoveBuilder()
                .build(

                    game

                );

        }


        if(
            data.encounters
        )
        {

            new PokemonEncounterBuilder()
                .build(

                    game

                );

        }


        //========================================
        // Location Database
        //========================================

        // Build locations before Pokémon
        // availability so the availability
        // builder can use the generated
        // location graph, gates, and encounters.

        new LocationBuilder()
            .build(

                game

            );


        //========================================
        // Trainer Database
        //========================================

        new TrainerBuilder()
            .build(

                game

            );


        //========================================
        // NPC Database
        //
        // TrainerBuilder has now created:
        //
        // database/generated/<game>/full-trainers.json
        //
        // NPCEventGenerator receives:
        // - extracted NPC objects
        // - extracted event scripts
        // - complete trainer database
        // - extracted map objects
        // - extracted map scripts
        // - extracted coordinate events
        //
        // Map objects, map scripts, and coordinate
        // events allow NPC classification to resolve
        // scene-driven characters and coordinate-triggered
        // battles that do not originate from a direct
        // object interaction.
        //
        // This must run before Pokémon availability
        // because availability consumes the classified
        // special encounter information produced here.
        //========================================

        if(
            data.npcs
            &&
            data.events
        )
        {

            console.log(
                "Building NPC database..."
            );


            const trainerPath =
                path.join(

                    __dirname,

                    "../../database/generated",

                    game,

                    "full-trainers.json"

                );


            if(
                !fs.existsSync(
                    trainerPath
                )
            )
            {

                throw new Error(

                    `Trainer database missing: ${trainerPath}`

                );

            }


            const trainers =
                JSON.parse(

                    fs.readFileSync(

                        trainerPath,

                        "utf8"

                    )

                );


            new NPCEventGenerator()
                .generate(

                    data.npcs,

                    data.events,

                    trainers,

                    game,

                    data.objects || [],

                    data.mapScripts || {},

                    data.coordinateEvents || {}

                );

        }


        //========================================
        // Pokémon Availability Database
        //========================================

        if(
            data.species
            &&
            data.encounters
        )
        {

            console.log(
                "Building Pokémon availability database..."
            );


            //====================================
            // Evolution database
            //====================================

            const evolutionDatabasePath =
                path.join(

                    process.cwd(),

                    "database",

                    "raw",

                    game,

                    "pokemon-evolutions.json"

                );


            if(
                !fs.existsSync(
                    evolutionDatabasePath
                )
            )
            {

                throw new Error(

                    `Evolution database missing: ${evolutionDatabasePath}`

                );

            }


            const evolutionDatabase =
                JSON.parse(

                    fs.readFileSync(

                        evolutionDatabasePath,

                        "utf8"

                    )

                );


            //====================================
            // Event database
            //====================================

            const eventDatabase =
                data.events
                ||
                {};


            //====================================
            // Location database
            //====================================

            const locationDatabasePath =
                path.join(

                    process.cwd(),

                    "database",

                    "generated",

                    game,

                    "locations.json"

                );


            if(
                !fs.existsSync(
                    locationDatabasePath
                )
            )
            {

                throw new Error(

                    `Location database missing: ${locationDatabasePath}`

                );

            }


            const locationDatabase =
                JSON.parse(

                    fs.readFileSync(

                        locationDatabasePath,

                        "utf8"

                    )

                );


            //====================================
            // Availability builder
            //====================================

            const availabilityBuilder =
                new PokemonAvailabilityBuilder(

                    data.species,

                    data.encounters,

                    evolutionDatabase,

                    null,

                    ProgressionRules[game],

                    null,

                    null,

                    eventDatabase,

                    locationDatabase

                );


            const availability =
                availabilityBuilder.build();


            new PokemonAvailabilityGenerator()
                .generate(

                    {
                        availability
                    },

                    game

                );

        }


        //========================================
        // Move Learner Database
        //========================================

        new MoveLearnerGenerator()
            .generate(

                game

            );


        new MoveLearnerBuilder()
            .build(

                game

            );


        //========================================
        // Gym Builder
        //========================================

        if(
            gyms
            &&
            !this.built.gyms
        )
        {

            console.log(
                "Building gym database..."
            );


            new GymBuilder()
                .build(

                    game

                );


            this.built.gyms =
                true;

        }


        //========================================
        // Progression Builder
        //========================================

        if(
            (
                rules
                ||
                worldGates
            )
            &&
            !this.built.progression
        )
        {

            console.log(
                "Building progression database..."
            );


            new ProgressionBuilder()
                .build(

                    game

                );


            this.built.progression =
                true;

        }


        //========================================
        // Story Event Mapping
        //========================================

        const eventMappings =
            EventMappings[game];


        if(
            eventMappings
        )
        {

            new StoryEventMapGenerator()
                .generate(

                    eventMappings,

                    game

                );

        }


        //========================================
        // Dialogue
        //========================================

        if(
            data.dialogues
        )
        {

            new DialogueBuilder()
                .build(

                    data.dialogues,

                    game

                );

        }


        //========================================
        // Complete
        //========================================

        console.log();


        console.log(
            "Build Manager completed."
        );


        console.log();


        return {

            success:
                true,

            game

        };

    }


}


module.exports =
    BuildManager;