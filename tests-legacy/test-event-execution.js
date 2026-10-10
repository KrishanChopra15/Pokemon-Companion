"use strict";


const EventService =
    require("../scripts/services/event-service");


const TrainerState =
    require("../scripts/domain/trainer-state");



console.log(
    "=============================="
);

console.log(
    "Event Execution Test"
);

console.log(
    "=============================="
);



const eventService =
    new EventService(
        "firered"
    );



const trainer =
    new TrainerState();



const billEvent =
    eventService.getEvent(
        "CinnabarIsland_PokemonCenter_1F_EventScript_Bill"
    );



console.log(
    "Before:"
);


console.log(
    trainer.getState()
);



console.log();



const result =
    eventService.executeEvent(
        billEvent,
        trainer
    );



console.log(
    "Execution Result:"
);


console.log(
    result
);