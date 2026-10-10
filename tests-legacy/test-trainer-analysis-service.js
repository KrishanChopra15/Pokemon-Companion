/**
 * Pokémon Companion
 * Trainer Analysis Service Test
 *
 * Tests:
 * - Trainer resolution
 * - Team analysis
 * - Type analysis
 * - Team power calculation
 * - Weakness analysis
 * - Player matchup analysis
 */

"use strict";



const TrainerAnalysisService =
    require("../scripts/services/trainer-analysis-service");


const TrainerDatabaseService =
    require("../scripts/services/trainer-database-service");


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");









//--------------------------------
// Databases
//--------------------------------


const trainerDatabase =
    new TrainerDatabaseService(
        "firered"
    );



const pokemonDatabase =
    new PokemonDatabaseService(
        "firered"
    );









//--------------------------------
// Service
//--------------------------------


const trainerAnalysis =
    new TrainerAnalysisService(

        trainerDatabase,

        pokemonDatabase

    );









//--------------------------------
// Mock player team
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

    }


];









console.log();

console.log(
    "================================"
);

console.log(
    "Trainer Analysis Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Analyze Brock
//--------------------------------


console.log();

console.log(
    "Analyzing Brock:"
);


const brock =
    trainerAnalysis.analyzeTrainer(

        "BROCK"

    );


console.log(

    brock

);









//--------------------------------
// Brock summary
//--------------------------------


console.log();

console.log(
    "Brock summary:"
);


console.log({

    name:
        brock.name,


    teamSize:
        brock.teamSize,


    highestLevel:
        brock.highestLevel,


    averageLevel:
        brock.averageLevel,


    types:
        brock.types,


    power:
        brock.teamPower


});









//--------------------------------
// Brock weaknesses
//--------------------------------


console.log();

console.log(
    "Brock weaknesses:"
);


console.log(

    brock.weaknesses

);









//--------------------------------
// Analyze with player team
//--------------------------------


console.log();

console.log(
    "Brock matchup:"
);


console.log(

    trainerAnalysis.analyzeTrainer(

        "BROCK",

        playerTeam

    )

);









//--------------------------------
// Analyze Misty
//--------------------------------


console.log();

console.log(
    "Analyzing Misty:"
);


const misty =
    trainerAnalysis.analyzeTrainer(

        "MISTY"

    );


console.log(

    misty

);









//--------------------------------
// Missing trainer
//--------------------------------


console.log();

console.log(
    "Missing trainer:"
);


console.log(

    trainerAnalysis.analyzeTrainer(

        "UNKNOWN"

    )

);









console.log();

console.log(
    "Trainer Analysis Service Tests Completed."
);

console.log();