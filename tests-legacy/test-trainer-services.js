/**
 * Pokémon Companion
 * Trainer Services Test
 *
 * Tests:
 * - Trainer database service.
 * - Pokémon database service.
 * - Trainer analysis service.
 * - Trainer difficulty service.
 */

"use strict";


const TrainerDatabaseService =
    require("../scripts/services/trainer-database-service");


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");


const TrainerAnalysisService =
    require("../scripts/services/trainer-analysis-service");


const TrainerDifficultyService =
    require("../scripts/services/trainer-difficulty-service");



const trainers =
    new TrainerDatabaseService(
        "firered"
    );


const pokemon =
    new PokemonDatabaseService(
        "firered"
    );


const analysisService =
    new TrainerAnalysisService(
        trainers,
        pokemon
    );


const difficultyService =
    new TrainerDifficultyService();



const brock =
    analysisService.analyzeTrainer(
        "TRAINER_LEADER_BROCK"
    );



console.log("Trainer:");
console.log(
    brock.name
);



console.log();

console.log("Team size:");
console.log(
    brock.teamSize
);



console.log();

console.log("Types:");
console.log(
    brock.types
);



console.log();

console.log("Difficulty:");

console.log(
    difficultyService.calculate(
        brock
    )
);