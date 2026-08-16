/**
 * Pokémon Companion
 * Objective Service Test
 *
 * Tests:
 * - Combined objectives
 * - Story objectives
 * - Gym objectives
 * - Objective filtering
 * - Next objective selection
 */

"use strict";


const ObjectiveService =
    require("../scripts/services/objective-service");


const StoryProgressionService =
    require("../scripts/services/story-progression-service");


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const GymRewardService =
    require("../scripts/services/gym-reward-service");


const GymService =
    require("../scripts/services/gym-service");


const ProgressionService =
    require("../scripts/services/progression-service");


const TrainerState =
    require("../scripts/domain/trainer-state");







//--------------------------------
// Services
//--------------------------------


const story =
    new StoryProgressionService();



const gymProgression =
    new GymProgressionService();



const gymRewards =
    new GymRewardService();



const gym =
    new GymService(

        gymProgression,

        gymRewards

    );



const progression =
    new ProgressionService();





const objectives =
    new ObjectiveService(

        story,

        gym,

        progression

    );







//--------------------------------
// Player
//--------------------------------


const player =
    new TrainerState();









console.log();

console.log(
    "================================"
);

console.log(
    "Objective Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// New game
//--------------------------------


console.log();

console.log(
    "New game objectives:"
);


console.log(

    objectives.getObjectives(
        player
    )

);







console.log();

console.log(
    "Next objective:"
);


console.log(

    objectives.getNextObjective(
        player
    )

);







console.log();

console.log(
    "Story objectives only:"
);


console.log(

    objectives.getObjectivesByType(

        "STORY",

        player

    )

);







console.log();

console.log(
    "Gym objectives only:"
);


console.log(

    objectives.getObjectivesByType(

        "GYM",

        player

    )

);









//--------------------------------
// Progress story
//--------------------------------


console.log();

console.log(
    "Completing Oak Parcel..."
);


player.addStoryFlag(
    "OAK_PARCEL_DELIVERED"
);





console.log();

console.log(
    "Objectives after Oak Parcel:"
);


console.log(

    objectives.getObjectives(
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



const brockResult =
    gym.completeGym(

        "TRAINER_LEADER_BROCK",

        player

    );



console.log(
    brockResult
);







console.log();

console.log(
    "Objectives after Brock:"
);


console.log(

    objectives.getObjectives(
        player
    )

);









//--------------------------------
// Complete Mt Moon
//--------------------------------


console.log();

console.log(
    "Completing Mt Moon..."
);


player.addStoryFlag(
    "MT_MOON_COMPLETED"
);





console.log();

console.log(
    "Story objectives after Mt Moon:"
);


console.log(

    objectives.getObjectivesByType(

        "STORY",

        player

    )

);









//--------------------------------
// Summary
//--------------------------------


console.log();

console.log(
    "Objective summary:"
);


console.log(

    objectives.getSummary(
        player
    )

);









console.log();

console.log(
    "Has objectives:"
);


console.log(

    objectives.hasObjectives(
        player
    )

);







console.log();

console.log(
    "Objective Service Tests Completed."
);

console.log();