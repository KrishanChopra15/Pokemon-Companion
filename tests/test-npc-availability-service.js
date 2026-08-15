/**
 * Pokémon Companion
 * NPC Availability Service Test
 */

"use strict";


const NPCService =
    require("../scripts/services/npc-service");


const EventService =
    require("../scripts/services/event-service");


const NPCAvailabilityService =
    require("../scripts/services/npc-availability-service");


const TrainerState =
    require("../scripts/domain/trainer-state");



const npc =
    new NPCService(
        "firered"
    );


const events =
    new EventService(
        "firered"
    );


const availability =
    new NPCAvailabilityService(
        npc,
        events
    );





console.log(
    "================================"
);

console.log(
    "NPC Availability Service Test"
);

console.log(
    "================================"
);





const location =
    "MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F";





//--------------------------------
// Before Bill
//--------------------------------


const beforeState =
    new TrainerState();



console.log();

console.log(
    "=== NPCs Before Helping Bill ==="
);



console.log(
    JSON.stringify(
        availability.getAvailableNPCs(
            location,
            beforeState
        ),
        null,
        4
    )
);





//--------------------------------
// After Bill
//--------------------------------


const afterState =
    new TrainerState();


afterState.addStoryFlag(
    "BILL_HELPED"
);



console.log();

console.log(
    "=== NPCs After Helping Bill ==="
);



console.log(
    JSON.stringify(
        availability.getAvailableNPCs(
            location,
            afterState
        ),
        null,
        4
    )
);