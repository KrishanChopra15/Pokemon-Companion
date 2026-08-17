/**
 * Pokémon Companion
 * Gym Event Service Test
 *
 * Tests:
 * - Gym event mapping
 * - Battle event lookup
 * - Badge rewards
 * - TM rewards
 * - HM ability unlocks
 * - Gym completion
 */

"use strict";


const GymEventService =
    require("../scripts/services/gym-event-service");


const TrainerState =
    require("../scripts/domain/trainer-state");







//--------------------------------
// Services
//--------------------------------


const gymEvents =
    new GymEventService();



const player =
    new TrainerState();








console.log();

console.log(
    "========================================"
);

console.log(
    "Gym Event Service Tests"
);

console.log(
    "========================================"
);









//--------------------------------
// All gym mappings
//--------------------------------


console.log();

console.log(
    "Brock event mapping:"
);


console.log(

    gymEvents.getGymEvent(

        "TRAINER_LEADER_BROCK"

    )

);









console.log();

console.log(
    "Giovanni event mapping:"
);


console.log(

    gymEvents.getGymEvent(

        "TRAINER_LEADER_GIOVANNI"

    )

);









//--------------------------------
// Event ID lookup
//--------------------------------


console.log();

console.log(
    "Brock battle event ID:"
);


console.log(

    gymEvents.getEventId(

        "TRAINER_LEADER_BROCK"

    )

);









//--------------------------------
// Badge lookup
//--------------------------------


console.log();

console.log(
    "Brock badge:"
);


console.log(

    gymEvents.getBadge(

        "TRAINER_LEADER_BROCK"

    )

);









console.log();

console.log(
    "Giovanni badge:"
);


console.log(

    gymEvents.getBadge(

        "TRAINER_LEADER_GIOVANNI"

    )

);









//--------------------------------
// Reward lookup
//--------------------------------


console.log();

console.log(
    "Brock rewards:"
);


console.log(

    gymEvents.getRewards(

        "TRAINER_LEADER_BROCK"

    )

);









//--------------------------------
// Initial state
//--------------------------------


console.log();

console.log(
    "Initial trainer state:"
);


console.log(

    player.serialize()

);









//--------------------------------
// Complete Brock
//--------------------------------


console.log();

console.log(
    "Completing Brock gym:"
);


console.log(

    gymEvents.completeGym(

        "TRAINER_LEADER_BROCK",

        player

    )

);









console.log();

console.log(
    "State after Brock:"
);


console.log(

    player.serialize()

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
    "Has Rock Tomb TM:"
);


console.log(

    player.hasItem(

        "TM39_ROCK_TOMB"

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









//--------------------------------
// Complete Giovanni
//--------------------------------


console.log();

console.log(
    "Completing Giovanni gym:"
);


console.log(

    gymEvents.completeGym(

        "TRAINER_LEADER_GIOVANNI",

        player

    )

);









console.log();

console.log(
    "State after Giovanni:"
);


console.log(

    player.serialize()

);









//--------------------------------
// Unknown gym
//--------------------------------


console.log();

console.log(
    "Unknown gym:"
);


console.log(

    gymEvents.completeGym(

        "UNKNOWN_GYM",

        player

    )

);









console.log();

console.log(
    "Gym Event Service Tests Completed."
);

console.log();