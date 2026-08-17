/**
 * Pokémon Companion
 * Battle Service Test
 *
 * Tests:
 * - Battle creation
 * - Battle preparation connection
 * - Active battle tracking
 * - Battle completion
 * - Victory result
 */

"use strict";


const BattleService =
    require("../scripts/services/battle-service");


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





const battleService =
    new BattleService(

        battlePreparation

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
    "Battle Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Start battle
//--------------------------------


console.log();

console.log(
    "Starting Brock battle:"
);


const battleResult =
    battleService.startTrainerBattle(

        "BROCK",

        player

    );



console.log(

    battleResult

);









//--------------------------------
// Battle ID
//--------------------------------


const battleId =
    battleResult.battleId;



console.log();

console.log(
    "Battle ID:"
);


console.log(

    battleId

);









//--------------------------------
// Get battle
//--------------------------------


console.log();

console.log(
    "Loaded battle:"
);


console.log(

    battleService.getBattle(

        battleId

    )

);









//--------------------------------
// Active check
//--------------------------------


console.log();

console.log(
    "Battle active:"
);


console.log(

    battleService.isActive(

        battleId

    )

);









//--------------------------------
// Active battles
//--------------------------------


console.log();

console.log(
    "Active battles:"
);


console.log(

    battleService.getActiveBattles()

);









//--------------------------------
// Win battle
//--------------------------------


console.log();

console.log(
    "Winning battle:"
);


const victory =
    battleService.winBattle(

        battleId

    );



console.log(

    victory

);









//--------------------------------
// After completion
//--------------------------------


console.log();

console.log(
    "Battle after victory:"
);


console.log(

    battleService.getBattle(

        battleId

    )

);









//--------------------------------
// Active check after win
//--------------------------------


console.log();

console.log(
    "Battle active after victory:"
);


console.log(

    battleService.isActive(

        battleId

    )

);









//--------------------------------
// Statistics
//--------------------------------


console.log();

console.log(
    "Battle count:"
);


console.log(

    battleService.getBattleCount()

);









//--------------------------------
// Clear
//--------------------------------


console.log();

console.log(
    "Clearing battle:"
);


console.log(

    battleService.clearBattle(

        battleId

    )

);









console.log();

console.log(
    "Battle count after clear:"
);


console.log(

    battleService.getBattleCount()

);









console.log();

console.log(
    "Battle Service Tests Completed."
);

console.log();