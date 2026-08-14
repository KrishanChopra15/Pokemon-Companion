/**
 * Pokémon Companion
 * Trainer Recommendation Service Test
 */

"use strict";


const TrainerDatabaseService =
    require("../scripts/services/trainer-database-service");


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");


const TrainerAnalysisService =
    require("../scripts/services/trainer-analysis-service");


const TrainerRecommendationService =
    require("../scripts/services/trainer-recommendation-service");



const trainers =
    new TrainerDatabaseService("firered");


const pokemon =
    new PokemonDatabaseService("firered");



const analysisService =
    new TrainerAnalysisService(
        trainers,
        pokemon
    );



const recommendationService =
    new TrainerRecommendationService(
        pokemon
    );



const brock =
    analysisService.analyzeTrainer(
        "TRAINER_LEADER_BROCK"
    );



console.log(
    recommendationService.recommend(
        brock
    )
);