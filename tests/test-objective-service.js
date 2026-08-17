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
 * - Gym unlock progression
 * - Objective summary
 */

"use strict";


const ObjectiveService =
    require("../scripts/services/objective-service");


const StoryProgressionService =
    require("../scripts/services/story-progression-service");


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const GymService =
    require("../scripts/services/gym-service");


const GymRewardService =
    require("../scripts/services/gym-reward-service");


const TrainerState =
    require("../scripts/domain/trainer-state");









//--------------------------------
// Services
//--------------------------------


const story =
    new StoryProgressionService();



const gymProgression =
    new GymProgressionService();



const gymReward =
    new GymRewardService();



const gym =
    new GymService(

        gymProgression,

        gymReward

    );





const objectives =
    new ObjectiveService(

        story,

        gym,

        null

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









//--------------------------------
// Story objectives
//--------------------------------


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









//--------------------------------
// Gym objectives
//--------------------------------


console.log();

console.log(
    "Initial gym objectives:"
);


console.log(

    objectives.getObjectivesByType(

        "GYM",

        player

    )

);









//--------------------------------
// Oak Parcel
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
// Receive Pokedex
//--------------------------------


console.log();

console.log(
    "Receiving Pokedex..."
);


player.addStoryFlag(
    "POKEDEX_RECEIVED"
);





console.log();

console.log(
    "Objectives after Pokedex:"
);


console.log(

    objectives.getObjectives(
        player
    )

);









//--------------------------------
// Brock
//--------------------------------


console.log();

console.log(
    "Available gyms before Brock:"
);


console.log(

    objectives.getObjectivesByType(

        "GYM",

        player

    )

);







console.log();

console.log(
    "Defeating Brock..."
);


const brock =
    gym.completeGym(

        "TRAINER_LEADER_BROCK",

        player

    );



console.log(
    brock
);







console.log();

console.log(
    "State after Brock:"
);


console.log(
    player.serialize()
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
// Boulder badge progression
//--------------------------------


console.log();

console.log(
    "Checking Misty availability:"
);


console.log(

    objectives.getObjectivesByType(

        "GYM",

        player

    )

);









//--------------------------------
// Mt Moon
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