/**
 * Pokémon Companion
 * Battle Preparation Service Test
 *
 * Tests:
 * - Trainer resolution
 * - Player party loading
 * - Opponent party loading
 * - Battle metadata
 * - AI configuration
 */

"use strict";


const BattlePreparationService =
    require("../scripts/services/battle-preparation-service");


const TrainerDatabaseService =
    require("../scripts/services/trainer-database-service");


const TrainerState =
    require("../scripts/domain/trainer-state");









//--------------------------------
// Services
//--------------------------------


const trainerDatabase =
    new TrainerDatabaseService();



console.log(
    "Loaded trainers:",
    trainerDatabase.getAllTrainers().length
);





const battlePreparation =
    new BattlePreparationService(

        trainerDatabase

    );





const player =
    new TrainerState();









//--------------------------------
// Add player Pokémon
//--------------------------------


player.pokemon.push(

    {

        species:
            "CHARMANDER",

        level:
            10,

        hp:
            30,

        moves:
        [

            "SCRATCH",

            "EMBER"

        ]

    }

);









console.log();

console.log(
    "================================"
);

console.log(
    "Battle Preparation Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Trainer lookup
//--------------------------------


console.log();

console.log(
    "Brock trainer:"
);


console.log(

    battlePreparation.getTrainer(

        "BROCK"

    )

);









//--------------------------------
// Trainer party
//--------------------------------


console.log();

console.log(
    "Brock party:"
);


console.log(

    battlePreparation.getTrainerParty(

        "BROCK"

    )

);









//--------------------------------
// Prepare battle
//--------------------------------


console.log();

console.log(
    "Preparing Brock battle:"
);


const result =
    battlePreparation.prepareTrainerBattle(

        "BROCK",

        player

    );



console.log(

    result

);









//--------------------------------
// Validation
//--------------------------------


console.log();

console.log(
    "Battle ready:"
);


console.log(

    result.success

);









//--------------------------------
// Player party
//--------------------------------


console.log();

console.log(
    "Player party:"
);


console.log(

    result.player

);









//--------------------------------
// Opponent
//--------------------------------


console.log();

console.log(
    "Opponent:"
);


console.log(

    result.opponent

);









//--------------------------------
// AI
//--------------------------------


console.log();

console.log(
    "AI Flags:"
);


console.log(

    result.opponent.aiFlags

);









//--------------------------------
// Summary
//--------------------------------


console.log();

console.log(
    "Battle summary:"
);


console.log(

    battlePreparation.getBattleSummary(

        "BROCK"

    )

);









console.log();

console.log(
    "Battle Preparation Tests Completed."
);

console.log();