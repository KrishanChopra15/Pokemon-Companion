/**
 * Pokémon Companion
 * Gym Service Test
 *
 * Tests:
 * - Gym availability
 * - Gym event resolution
 * - Gym completion
 * - Badge rewards
 * - TM rewards
 * - HM unlocks
 * - Trainer progression
 * - Gym trainer resolution
 */

"use strict";


const GymService =
    require("../scripts/services/gym-service");


const GymDatabaseService =
    require("../scripts/services/gym-database-service");


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const GymEventService =
    require("../scripts/services/gym-event-service");


const GymRewardService =
    require("../scripts/services/gym-reward-service");


const TrainerDatabaseService =
    require("../scripts/services/trainer-database-service");


const TrainerState =
    require("../scripts/domain/trainer-state");







//--------------------------------
// Services
//--------------------------------


const gymDatabase =
    new GymDatabaseService();



console.log(
    "Loaded gyms:",
    gymDatabase.getAllGyms().length
);





const trainerDatabase =
    new TrainerDatabaseService();



console.log(
    "Loaded trainers:",
    trainerDatabase.getAllTrainers().length
);





const gymProgression =
    new GymProgressionService(

        gymDatabase

    );





const gymEvents =
    new GymEventService(

        gymDatabase

    );





const gymRewards =
    new GymRewardService(

        gymDatabase

    );





const gymService =
    new GymService(

        gymProgression,

        gymEvents,

        gymRewards,

        trainerDatabase

    );





const player =
    new TrainerState();









console.log();

console.log(
    "================================"
);

console.log(
    "Gym Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Initial gyms
//--------------------------------


console.log();

console.log(
    "Available gyms - new game:"
);


console.log(

    gymService.getAvailableGyms(

        player

    )

);









//--------------------------------
// Brock availability
//--------------------------------


console.log();

console.log(
    "Can challenge Brock without Pokedex:"
);


console.log(

    gymService.canChallenge(

        "TRAINER_LEADER_BROCK",

        player

    )

);









//--------------------------------
// Give Pokedex
//--------------------------------


console.log();

console.log(
    "Giving Pokedex..."
);


player.addStoryFlag(
    "POKEDEX_RECEIVED"
);









console.log();

console.log(
    "Can challenge Brock now:"
);


console.log(

    gymService.canChallenge(

        "TRAINER_LEADER_BROCK",

        player

    )

);









//--------------------------------
// Brock battle data
//--------------------------------


console.log();

console.log(
    "Brock battle data:"
);


console.log(

    gymService.getBattleData(

        "TRAINER_LEADER_BROCK"

    )

);









//--------------------------------
// Brock status
//--------------------------------


console.log();

console.log(
    "Brock status:"
);


console.log(

    gymService.getGymStatus(

        "TRAINER_LEADER_BROCK",

        player

    )

);









//--------------------------------
// Complete Brock
//--------------------------------


console.log();

console.log(
    "Defeating Brock..."
);


const result =
    gymService.completeGym(

        "TRAINER_LEADER_BROCK",

        player

    );



console.log();

console.log(
    "Completion result:"
);


console.log(
    result
);









//--------------------------------
// State after Brock
//--------------------------------


console.log();

console.log(
    "Trainer state after Brock:"
);


console.log(

    player.serialize()

);









//--------------------------------
// Rewards
//--------------------------------


console.log();

console.log(
    "Has Boulder Badge:"
);


console.log(

    player.hasBadge(

        "BOULDER_BADGE"

    )

);







console.log();

console.log(
    "Has Rock Tomb:"
);


console.log(

    player.hasItem(

        "TM39_ROCK_TOMB"

    )

);







console.log();

console.log(
    "Has Flash:"
);


console.log(

    player.hasHMAbility(

        "FLASH"

    )

);









//--------------------------------
// Completed check
//--------------------------------


console.log();

console.log(
    "Brock completed:"
);


console.log(

    player.hasCompletedBattle(

        "TRAINER_LEADER_BROCK"

    )

);









//--------------------------------
// Repeat challenge
//--------------------------------


console.log();

console.log(
    "Can challenge Brock again:"
);


console.log(

    gymService.canChallenge(

        "TRAINER_LEADER_BROCK",

        player

    )

);









//--------------------------------
// Next gyms
//--------------------------------


console.log();

console.log(
    "Available gyms after Brock:"
);


console.log(

    gymService.getAvailableGyms(

        player

    )

);









//--------------------------------
// Misty
//--------------------------------


console.log();

console.log(
    "Misty status:"
);


console.log(

    gymService.getGymStatus(

        "TRAINER_LEADER_MISTY",

        player

    )

);









console.log();

console.log(
    "Gym Service Tests Completed."
);

console.log();