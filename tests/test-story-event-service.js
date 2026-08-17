/**
 * Pokémon Companion
 * Story Event Service Test
 *
 * Tests:
 * - Story mapping lookup
 * - ROM event resolution
 * - Completion flags
 * - Story completion updates
 * - Unknown mappings
 */

"use strict";


const EventService =
    require("../scripts/services/event-service");


const StoryEventService =
    require("../scripts/services/story-event-service");


const TrainerState =
    require("../scripts/domain/trainer-state");




//--------------------------------
// Services
//--------------------------------


const eventService =
    new EventService(
        "firered"
    );



const storyEventService =
    new StoryEventService(
        eventService
    );



const player =
    new TrainerState();








console.log();

console.log(
    "================================"
);

console.log(
    "Story Event Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// GET OAK PARCEL
//--------------------------------


console.log();

console.log(
    "GET_OAK_PARCEL event:"
);


const oakEvent =
    storyEventService.getEvent(
        "GET_OAK_PARCEL"
    );


console.log(
    oakEvent
);





console.log();

console.log(
    "GET_OAK_PARCEL completion flag:"
);


console.log(

    storyEventService.getCompletionFlag(
        "GET_OAK_PARCEL"
    )

);









//--------------------------------
// RECEIVE POKEDEX
//--------------------------------


console.log();

console.log(
    "RECEIVE_POKEDEX event:"
);


const dexEvent =
    storyEventService.getEvent(
        "RECEIVE_POKEDEX"
    );


console.log(
    dexEvent
);





console.log();

console.log(
    "RECEIVE_POKEDEX completion flag:"
);


console.log(

    storyEventService.getCompletionFlag(
        "RECEIVE_POKEDEX"
    )

);









//--------------------------------
// Unknown mapping
//--------------------------------


console.log();

console.log(
    "Unknown story event:"
);


console.log(

    storyEventService.getEvent(
        "UNKNOWN_EVENT"
    )

);









console.log();

console.log(
    "Unknown completion flag:"
);


console.log(

    storyEventService.getCompletionFlag(
        "UNKNOWN_EVENT"
    )

);









//--------------------------------
// Complete story event
//--------------------------------


console.log();

console.log(
    "Initial trainer state:"
);


console.log(
    player.serialize()
);





console.log();

console.log(
    "Completing Oak Parcel story:"
);


console.log(

    storyEventService.completeStoryEvent(

        "GET_OAK_PARCEL",

        player

    )

);









console.log();

console.log(
    "Trainer state after completion:"
);


console.log(
    player.serialize()
);









console.log();

console.log(
    "Has OAK_PARCEL_DELIVERED flag:"
);


console.log(

    player.hasStoryFlag(
        "OAK_PARCEL_DELIVERED"
    )

);









//--------------------------------
// Complete unknown story
//--------------------------------


console.log();

console.log(
    "Completing unknown story:"
);


console.log(

    storyEventService.completeStoryEvent(

        "UNKNOWN_EVENT",

        player

    )

);









console.log();

console.log(
    "Story Event Service Tests Completed."
);

console.log();