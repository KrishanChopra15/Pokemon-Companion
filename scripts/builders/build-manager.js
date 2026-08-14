/**
 * Pokémon Companion
 * Build Manager
 *
 * Coordinates generators and builders for a game.
 *
 * Responsibilities:
 * - Generate raw databases.
 * - Generate reference databases.
 * - Build generated databases.
 *
 * Does NOT:
 * - Read ROMs.
 * - Extract ROM data.
 * - Parse binary data.
 */

"use strict";


//----------------------------------------
// Raw Generators
//----------------------------------------

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

const PokemonMachineGenerator =
    require("../generators/raw/pokemon-machine-generator");

const PokemonEggMoveGenerator =
    require("../generators/raw/pokemon-egg-move-generator");

const TrainerGenerator =
    require("../generators/raw/trainer-generator");

const TrainerPartyGenerator =
    require("../generators/raw/trainer-party-generator");

//----------------------------------------
// Reference Generators
//----------------------------------------

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

const EvolutionMethodGenerator =
    require("../generators/reference/evolution-method-generator");

const MachineGenerator =
    require("../generators/reference/machine-generator");

const MoveEffectGenerator =
    require("../generators/reference/move-effects-generator");

const MoveTargetGenerator =
    require("../generators/reference/move-targets-generator");


//----------------------------------------
// Generated Database Generators
//----------------------------------------

const MoveLearnerGenerator =
    require("../generators/generated/move-learner-generator");


//----------------------------------------
// Builders
//----------------------------------------

const PokemonSpeciesBuilder =
    require("./pokemon-species-builder");

const PokemonMoveBuilder =
    require("./pokemon-move-builder");

const PokemonEncounterBuilder =
    require("./pokemon-encounter-builder");

const MoveLearnerBuilder =
    require("./move-learner-builder");

const TrainerBuilder =
    require("./trainer-builder");



class BuildManager {


    /**
     * Build all databases for a game.
     *
     * @param {string} game
     * @param {Object} data
     */
    buildGame(game, data) {


        console.log();
        console.log("========================================");
        console.log("Build Manager");
        console.log("========================================");
        console.log();


        //----------------------------------------
        // Raw databases
        //----------------------------------------

        console.log("Generating raw databases...");


        new PokemonSpeciesGenerator()
            .generate(data.species);


        new PokemonMoveGenerator()
            .generate(data.moves);


        new PokemonEvolutionGenerator()
            .generate(game);


        new PokemonLearnsetGenerator()
            .generate(game);


        new PokemonEncounterGenerator()
            .generate(data.encounters);


        new PokemonMachineGenerator()
            .generate(game);


        new PokemonEggMoveGenerator()
            .generate(game);
            
            
        new TrainerGenerator()
            .generate(game);
            
            
        new TrainerPartyGenerator()
            .generate(game);



        //----------------------------------------
        // Reference databases
        //----------------------------------------

        console.log();

        console.log("Generating reference databases...");


        new SpeciesNameGenerator()
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


        new EvolutionMethodGenerator()
            .generate();


        new MachineGenerator()
            .generate();


        new MoveEffectGenerator()
            .generate();


        new MoveTargetGenerator()
            .generate();



        //----------------------------------------
        // Generated databases
        //----------------------------------------

        console.log();

        console.log("Generating generated databases...");


        new PokemonSpeciesBuilder()
            .build(game);


        new PokemonMoveBuilder()
            .build(game);


        new PokemonEncounterBuilder()
            .build(game);


        new MoveLearnerGenerator()
            .generate(game);


        new MoveLearnerBuilder()
            .build(game);


        new TrainerBuilder()
            .build(game);



        //----------------------------------------
        // Complete
        //----------------------------------------

        console.log();

        console.log("Build Manager completed.");

        console.log();

    }

}


module.exports = BuildManager;