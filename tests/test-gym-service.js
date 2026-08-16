/**
 * Pokémon Companion
 * Gym Service Test
 *
 * Tests:
 * - Gym challenge availability
 * - Gym completion
 * - Reward application
 * - Trainer progression update
 * - Next gym unlock
 */

"use strict";


const GymService =
    require("../scripts/services/gym-service");


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const GymRewardService =
    require("../scripts/services/gym-reward-service");


const TrainerState =
    require("../scripts/domain/trainer-state");







const gymProgression =
    new GymProgressionService();



const gymRewards =
    new GymRewardService();



const gymService =
    new GymService(

        gymProgression,

        gymRewards

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
// Available gyms - new game
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
// Can challenge Brock
//--------------------------------


console.log();

console.log(
    "Can challenge Brock:"
);


console.log(

    gymService.canChallenge(

        "TRAINER_LEADER_BROCK",

        player

    )

);








//--------------------------------
// Brock status before battle
//--------------------------------


console.log();

console.log(
    "Brock status before battle:"
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
    "Gym completion result:"
);


console.log(
    result
);








//--------------------------------
// Check rewards
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
    "Has Flash ability:"
);


console.log(

    player.hasHMAbility(
        "FLASH"
    )

);







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
// Brock again
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
// Available gyms after Brock
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
// Misty availability
//--------------------------------


console.log();

console.log(
    "Can challenge Misty:"
);


console.log(

    gymService.canChallenge(

        "TRAINER_LEADER_MISTY",

        player

    )

);








console.log();

console.log(
    "Gym Service Tests Completed."
);

console.log();