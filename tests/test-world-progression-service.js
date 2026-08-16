/**
 * Pokémon Companion
 * World Progression Service Test
 *
 * Tests:
 * - Story objectives
 * - Gym objectives
 * - Combined world progression
 * - Badge progression
 * - World summary
 */

"use strict";



const WorldProgressionService =
    require("../scripts/services/world-progression-service");


const StoryProgressionService =
    require("../scripts/services/story-progression-service");


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const ProgressionService =
    require("../scripts/services/progression-service");


const TrainerState =
    require("../scripts/domain/trainer-state");





const story =
    new StoryProgressionService();



const gyms =
    new GymProgressionService();



const progression =
    new ProgressionService();



const world =
    new WorldProgressionService(

        story,

        gyms,

        progression

    );





const player =
    new TrainerState();








console.log();

console.log(
    "================================"
);

console.log(
    "World Progression Service Tests"
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

    world.getCurrentObjectives(
        player
    )

);








//--------------------------------
// World summary
//--------------------------------


console.log();

console.log(
    "New game world summary:"
);


console.log(

    world.getWorldSummary(
        player
    )

);









//--------------------------------
// Complete Oak Parcel
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

    world.getCurrentObjectives(
        player
    )

);









//--------------------------------
// Add Boulder Badge
//--------------------------------


console.log();

console.log(
    "Adding Boulder Badge..."
);


player.addBadge(
    "BOULDER_BADGE"
);



console.log();

console.log(
    "Objectives after Boulder Badge:"
);


console.log(

    world.getCurrentObjectives(
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


player.completeBattle(
    "TRAINER_LEADER_BROCK"
);


player.addBadge(
    "BOULDER_BADGE"
);



console.log();

console.log(
    "Available gyms after Brock:"
);


console.log(

    world.getAvailableGyms(
        player
    )

);









//--------------------------------
// Complete all badges
//--------------------------------


console.log();

console.log(
    "Adding remaining badges..."
);



const badges = [

    "CASCADE_BADGE",

    "THUNDER_BADGE",

    "RAINBOW_BADGE",

    "SOUL_BADGE",

    "MARSH_BADGE",

    "VOLCANO_BADGE",

    "EARTH_BADGE"

];



for(
    const badge of badges
)
{

    player.addBadge(
        badge
    );

}







console.log();

console.log(
    "Objectives with 8 badges:"
);


console.log(

    world.getCurrentObjectives(
        player
    )

);









//--------------------------------
// Summary
//--------------------------------


console.log();

console.log(
    "Final world summary:"
);


console.log(

    world.getWorldSummary(
        player
    )

);









//--------------------------------
// Completion
//--------------------------------


console.log();

console.log(
    "Game complete:"
);


console.log(

    world.isGameComplete(
        player
    )

);





console.log();

console.log(
    "World Progression Service Tests Completed."
);

console.log();