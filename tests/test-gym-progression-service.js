/**
 * Pokémon Companion
 * Gym Progression Service Test
 *
 * Tests:
 * - Gym database
 * - Gym lookup
 * - Gym requirements
 * - Available gyms
 * - Badge progression
 * - Gym completion
 */

"use strict";


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const TrainerState =
    require("../scripts/domain/trainer-state");



const gyms =
    new GymProgressionService();



const player =
    new TrainerState();





console.log();

console.log(
    "========================================"
);

console.log(
    "Gym Progression Tests"
);

console.log(
    "========================================"
);





//--------------------------------
// All gyms
//--------------------------------


console.log();

console.log(
    "All gyms:"
);


console.log(
    gyms.getAllGyms()
);





//--------------------------------
// Single gym lookup
//--------------------------------


console.log();

console.log(
    "Brock:"
);


console.log(

    gyms.getGym(
        "TRAINER_LEADER_BROCK"
    )

);





//--------------------------------
// Previous gyms
//--------------------------------


console.log();

console.log(
    "Before Misty:"
);


console.log(

    gyms.getPreviousGyms(
        "TRAINER_LEADER_MISTY"
    )

);





//--------------------------------
// New player available gyms
//--------------------------------


console.log();

console.log(
    "Available gyms - new game:"
);


console.log(

    gyms.getAvailableGyms(
        player
    )

);





//--------------------------------
// Challenge Brock
//--------------------------------


console.log();

console.log(
    "Can challenge Brock:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_BROCK",

        player

    )

);





//--------------------------------
// Defeat Brock
//--------------------------------


console.log();

console.log(
    "Defeating Brock..."
);


player.completeBattle(
    "TRAINER_LEADER_BROCK"
);


player.addBadge(
    "BOULDER_BADGE"
);





console.log();

console.log(
    "Completed gym count after Brock:"
);


console.log(

    gyms.getCompletedGymCount(
        player
    )

);





//--------------------------------
// Challenge Brock again
//--------------------------------


console.log();

console.log(
    "Can challenge Brock again:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_BROCK",

        player

    )

);





//--------------------------------
// After Boulder Badge
//--------------------------------


console.log();

console.log(
    "Available gyms after Boulder Badge:"
);


console.log(

    gyms.getAvailableGyms(
        player
    )

);





//--------------------------------
// Badge verification
//--------------------------------


console.log();

console.log(
    "Has Boulder Badge:"
);


console.log(

    gyms.hasBadge(

        "TRAINER_LEADER_BROCK",

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

    gyms.canChallengeGym(

        "TRAINER_LEADER_MISTY",

        player

    )

);





console.log();

console.log(
    "Gym progression tests completed."
);

console.log();