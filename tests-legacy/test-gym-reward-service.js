/**
 * Pokémon Companion
 * Gym Reward Service Test
 *
 * Tests:
 * - Badge rewards
 * - TM rewards
 * - HM field ability unlocks
 * - Completed gym tracking
 */

"use strict";


const GymRewardService =
    require("../scripts/services/gym-reward-service");


const TrainerState =
    require("../scripts/domain/trainer-state");





const rewards =
    new GymRewardService();



const player =
    new TrainerState();







console.log();

console.log(
    "================================"
);

console.log(
    "Gym Reward Service Tests"
);

console.log(
    "================================"
);








//--------------------------------
// Check Brock reward exists
//--------------------------------


console.log();

console.log(
    "Brock reward exists:"
);


console.log(

    rewards.hasReward(
        "TRAINER_LEADER_BROCK"
    )

);









//--------------------------------
// Before reward
//--------------------------------


console.log();

console.log(
    "Before defeating Brock:"
);


console.log(
    player.serialize()
);








//--------------------------------
// Give Brock rewards
//--------------------------------


console.log();

console.log(
    "Defeating Brock..."
);



const result =
    rewards.giveRewards(

        "TRAINER_LEADER_BROCK",

        player

    );



console.log();

console.log(
    "Reward result:"
);


console.log(
    result
);








//--------------------------------
// Check badge
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








//--------------------------------
// Check TM
//--------------------------------


console.log();

console.log(
    "Has TM39 Rock Tomb:"
);


console.log(

    player.hasItem(
        "TM39_ROCK_TOMB"
    )

);








//--------------------------------
// Check Flash ability
//--------------------------------


console.log();

console.log(
    "Has Flash field ability:"
);


console.log(

    player.hasHMAbility(
        "FLASH"
    )

);








//--------------------------------
// Check completed gym
//--------------------------------


console.log();

console.log(
    "Brock defeated:"
);


console.log(

    player.hasCompletedBattle(
        "TRAINER_LEADER_BROCK"
    )

);








//--------------------------------
// Give unknown gym
//--------------------------------


console.log();

console.log(
    "Unknown gym reward:"
);


console.log(

    rewards.giveRewards(

        "TRAINER_LEADER_UNKNOWN",

        player

    )

);








console.log();

console.log(
    "Gym Reward Service Tests Completed."
);

console.log();