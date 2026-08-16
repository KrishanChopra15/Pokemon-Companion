/**
 * Pokémon Companion
 * Story Progression Service Test
 *
 * Tests:
 * - Story rule database
 * - Objective availability
 * - Requirement checks
 * - Story flag progression
 */

"use strict";


const StoryProgressionService =
    require("../scripts/services/story-progression-service");


const TrainerState =
    require("../scripts/domain/trainer-state");



const story =
    new StoryProgressionService();



const player =
    new TrainerState();





console.log();

console.log(
    "================================"
);

console.log(
    "Story Progression Service Tests"
);

console.log(
    "================================"
);







//--------------------------------
// All rules
//--------------------------------


console.log();

console.log(
    "All story rules:"
);


console.log(
    story.getAllRules()
);







//--------------------------------
// New game objectives
//--------------------------------


console.log();

console.log(
    "New game objectives:"
);


console.log(

    story.getNextObjectives(
        player
    )

);







//--------------------------------
// Oak Parcel
//--------------------------------


console.log();

console.log(
    "Can complete Oak Parcel:"
);


console.log(

    story.canComplete(

        "GET_OAK_PARCEL",

        player

    )

);







console.log();

console.log(
    "Completing Oak Parcel..."
);


player.addStoryFlag(
    "OAK_PARCEL_DELIVERED"
);





console.log();

console.log(
    "Next objectives after Oak Parcel:"
);


console.log(

    story.getNextObjectives(
        player
    )

);








//--------------------------------
// Pokedex
//--------------------------------


console.log();

console.log(
    "Can receive Pokedex:"
);


console.log(

    story.canComplete(

        "RECEIVE_POKEDEX",

        player

    )

);





console.log();

console.log(
    "Receiving Pokedex..."
);


player.addStoryFlag(
    "POKEDEX_RECEIVED"
);








//--------------------------------
// Brock + Mt Moon
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
    "Can complete Mt Moon:"
);


console.log(

    story.canComplete(

        "COMPLETE_MT_MOON",

        player

    )

);








console.log();

console.log(
    "Completing Mt Moon..."
);


player.addStoryFlag(
    "MT_MOON_COMPLETED"
);






console.log();

console.log(
    "Next objectives after Mt Moon:"
);


console.log(

    story.getNextObjectives(
        player
    )

);








//--------------------------------
// Elite Four test
//--------------------------------


console.log();

console.log(
    "Elite Four without badges:"
);


console.log(

    story.canComplete(

        "UNLOCK_ELITE_FOUR",

        player

    )

);







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
    "Elite Four with all badges:"
);


console.log(

    story.canComplete(

        "UNLOCK_ELITE_FOUR",

        player

    )

);







console.log();

console.log(
    "Final objectives:"
);


console.log(

    story.getNextObjectives(
        player
    )

);







console.log();

console.log(
    "Story Progression Service Tests Completed."
);

console.log();