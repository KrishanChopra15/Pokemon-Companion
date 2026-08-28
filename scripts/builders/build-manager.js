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
 * - Build generated databases.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract ROM data.
 * - Parse binary data.
 */

"use strict";


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
// Rules
//========================================

const ProgressionRules =
{
    firered:
        require("../rules/firered-progression-rules")
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

class BuildManager {


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


        if(
            rules
            &&
            !this.built.progression
        )
        {

            console.log(
                "Generating progression database..."
            );


            new ProgressionGenerator()
                .generate(
                    rules,
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


            const availabilityBuilder =
                new PokemonAvailabilityBuilder(

                    data.species,

                    data.encounters,

                    null,

                    null

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
        // Location Database
        //========================================

        new LocationBuilder()
            .build(
                game
            );


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
        // Trainer Database
        //========================================

        new TrainerBuilder()
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
            rules
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