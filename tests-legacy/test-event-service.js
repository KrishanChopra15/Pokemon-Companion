/**
 * Pokémon Companion
 * Event Service Test
 */

"use strict";


const NPCService =
    require("../scripts/services/npc-service");


const EventService =
    require("../scripts/services/event-service");


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



console.log(
    "================================"
);

console.log(
    "Event Service Test"
);

console.log(
    "================================"
);





//--------------------------------
// Find Bill NPC
//--------------------------------


console.log();

console.log(
    "=== Find Bill NPC ==="
);



const billNPC =
    npc.getNPC(
        "CinnabarIsland_PokemonCenter_1F_EventScript_Bill"
    );


console.log(
    JSON.stringify(
        billNPC,
        null,
        4
    )
);





//--------------------------------
// Find Bill Event
//--------------------------------


console.log();

console.log(
    "=== Find Bill Event ==="
);



const billEvent =
    events.getEventsByNPC(
        billNPC.script
    )[0];



console.log(
    JSON.stringify(
        billEvent,
        null,
        4
    )
);





//--------------------------------
// Check Trigger
//--------------------------------


const trainer =
    new TrainerState();



console.log();

console.log(
    "=== Can Trigger Bill Event ==="
);



console.log(
    JSON.stringify(
        events.canTrigger(
            billEvent,
            trainer
        ),
        null,
        4
    )
);





//--------------------------------
// Event Visibility Before Help
//--------------------------------


console.log();

console.log(
    "=== Bill Visible Before Help ==="
);



console.log(
    JSON.stringify(
        events.canShowEvent(
            billEvent,
            trainer
        ),
        null,
        4
    )
);





//--------------------------------
// Available choices
//--------------------------------


console.log();

console.log(
    "=== Bill Choices ==="
);



const choices =
    events.getChoices(
        billEvent,
        trainer
    );


console.log(
    JSON.stringify(
        choices,
        null,
        4
    )
);





//--------------------------------
// Accept Bill
//--------------------------------


console.log();

console.log(
    "=== Accept Bill Request ==="
);



const acceptResult =
    events.executeChoice(
        choices[0],
        trainer
    );


console.log(
    JSON.stringify(
        acceptResult,
        null,
        4
    )
);





console.log();

console.log(
    "=== Trainer State After Accept ==="
);


console.log(
    JSON.stringify(
        trainer.getState(),
        null,
        4
    )
);





//--------------------------------
// Event Visibility After Help
//--------------------------------


console.log();

console.log(
    "=== Bill Visible After Help ==="
);



console.log(
    JSON.stringify(
        events.canShowEvent(
            billEvent,
            trainer
        ),
        null,
        4
    )
);







//--------------------------------
// Reject Bill
//--------------------------------


const rejectTrainer =
    new TrainerState();



console.log();

console.log(
    "=== Reject Bill Request ==="
);



const rejectResult =
    events.executeChoice(
        choices[1],
        rejectTrainer
    );


console.log(
    JSON.stringify(
        rejectResult,
        null,
        4
    )
);





console.log();

console.log(
    "=== Trainer State After Reject ==="
);


console.log(
    JSON.stringify(
        rejectTrainer.getState(),
        null,
        4
    )
);





console.log();

console.log(
    "=== Bill Visible After Reject ==="
);



console.log(
    JSON.stringify(
        events.canShowEvent(
            billEvent,
            rejectTrainer
        ),
        null,
        4
    )
);