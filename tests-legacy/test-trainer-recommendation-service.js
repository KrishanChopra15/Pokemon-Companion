/**
 * Pokémon Companion
 * Trainer Recommendation Service Test
 *
 * Tests:
 * - Trainer weakness analysis
 * - Database recommendations
 * - Player team ranking
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









//--------------------------------
// Services
//--------------------------------


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



const recommendationService =
    new TrainerRecommendationService(

        pokemon

    );









//--------------------------------
// Player team
//--------------------------------


const playerTeam =
[

    {

        species:
            "CHARMANDER",

        level:
            16

    },


    {

        species:
            "PIKACHU",

        level:
            20

    },


    {

        species:
            "BUTTERFREE",

        level:
            18

    },


    {

        species:
            "SQUIRTLE",

        level:
            15

    }

];









console.log();

console.log(
    "================================"
);

console.log(
    "Trainer Recommendation Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Brock analysis
//--------------------------------


console.log();

console.log(
    "Analyzing Brock:"
);


const brock =
    analysisService.analyzeTrainer(

        "TRAINER_LEADER_BROCK"

    );


console.log(

    brock

);









//--------------------------------
// Brock recommendation
//--------------------------------


console.log();

console.log(
    "Recommendations against Brock:"
);


console.log(

    recommendationService.recommend(

        brock

    )

);









//--------------------------------
// Player team recommendation
//--------------------------------


console.log();

console.log(
    "Player team ranking against Brock:"
);


console.log(

    recommendationService.recommend(

        brock,

        playerTeam

    )

);









//--------------------------------
// Misty
//--------------------------------


console.log();

console.log(
    "Analyzing Misty:"
);


const misty =
    analysisService.analyzeTrainer(

        "TRAINER_LEADER_MISTY"

    );


console.log(

    recommendationService.recommend(

        misty

    )

);









console.log();

console.log(
    "Trainer Recommendation Service Tests Completed."
);

console.log();