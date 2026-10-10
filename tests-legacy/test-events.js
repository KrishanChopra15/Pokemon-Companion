"use strict";

const EventService =
    require("../scripts/services/event-service");


const service =
    new EventService("firered");


console.log("==============================");
console.log("Event Database Test");
console.log("==============================");


console.log(
    "Total Events:",
    service.events.length
);


console.log();


const bill =
    service.getEvent(
        "CinnabarIsland_PokemonCenter_1F_EventScript_Bill"
    );


console.log(
    JSON.stringify(
        bill,
        null,
        4
    )
);