/**
 * Pokémon Companion
 * NPC Interaction Service Test
 *
 * Tests:
 * - Story event mapping
 * - Story alias resolution
 * - NPC lookup
 * - Dialogue loading
 * - Event execution
 * - Reward handling
 * - Story flag updates
 */

"use strict";


const NPCInteractionService =
    require("../scripts/services/npc-interaction-service");


const NPCService =
    require("../scripts/services/npc-service");


const EventService =
    require("../scripts/services/event-service");


const DialogueService =
    require("../scripts/services/dialogue-service");


const StoryEventService =
    require("../scripts/services/story-event-service");


const TrainerState =
    require("../scripts/domain/trainer-state");




//--------------------------------
// Services
//--------------------------------


const npcService =
    new NPCService(
        "firered"
    );



const eventService =
    new EventService(
        "firered"
    );



const dialogueService =
    new DialogueService(
        "firered"
    );



const storyEventService =
    new StoryEventService(
        eventService
    );






const interaction =
    new NPCInteractionService(

        npcService,

        eventService,

        dialogueService,

        storyEventService

    );






const player =
    new TrainerState();








console.log();

console.log(
    "================================"
);

console.log(
    "NPC Interaction Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Story mapping
//--------------------------------


console.log();

console.log(
    "Checking GET_OAK_PARCEL mapping:"
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
    "Oak completion flag:"
);


console.log(

    storyEventService.getCompletionFlag(
        "GET_OAK_PARCEL"
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
// Execute story event
//--------------------------------


console.log();

console.log(
    "Interacting with Oak Parcel:"
);



const oakResult =
    interaction.interact(

        "GET_OAK_PARCEL",

        player

    );





console.log();

console.log(
    "Interaction result:"
);


console.log(
    oakResult
);









//--------------------------------
// Verify rewards
//--------------------------------


console.log();

console.log(
    "Trainer state after event:"
);


console.log(
    player.serialize()
);







console.log();

console.log(
    "Has Oak Parcel key item:"
);


console.log(

    player.hasKeyItem(
        "OAKS_PARCEL"
    )

);







console.log();

console.log(
    "Has story completion flag:"
);


console.log(

    player.hasStoryFlag(
        "OAK_PARCEL_DELIVERED"
    )

);









//--------------------------------
// Duplicate event
//--------------------------------


console.log();

console.log(
    "Trying same event again:"
);


console.log(

    interaction.interact(

        "GET_OAK_PARCEL",

        player

    )

);









//--------------------------------
// Unknown story event
//--------------------------------


console.log();

console.log(
    "Unknown event:"
);


console.log(

    interaction.interact(

        "UNKNOWN_EVENT",

        player

    )

);









//--------------------------------
// Direct StoryEventService test
//--------------------------------


console.log();

console.log(
    "Unknown story mapping:"
);


console.log(

    storyEventService.getEvent(
        "UNKNOWN_STORY"
    )

);









console.log();

console.log(
    "NPC Interaction Service Tests Completed."
);

console.log();