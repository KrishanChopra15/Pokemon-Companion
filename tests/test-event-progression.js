/**
 * Pokémon Companion
 * Event Progression Test
 */

"use strict";


const fs =
require("fs");


const EventService =
require("../scripts/services/event-service");


const TrainerState =
require("../scripts/domain/trainer-state");



const service =
new EventService(
    "firered"
);



const trainer =
new TrainerState();



function test(
    name,
    eventId
)
{

    console.log();
    console.log("==============================");
    console.log(name);
    console.log("==============================");


    const event =
        service.getEvent(
            eventId
        );


    if(!event)
    {

        console.log(
            "EVENT NOT FOUND"
        );

        return;

    }



    const result =
        service.executeEvent(
            event,
            trainer
        );


    console.log(
        result
    );

}




//--------------------------------
// Should fail
//--------------------------------


test(
    "Snorlax without Poké Flute",
    "Route12_EventScript_Snorlax"
);




//--------------------------------
// Add Poké Flute
//--------------------------------


trainer.addKeyItem(
    "POKE_FLUTE"
);



trainer.addStoryFlag(
    "GOT_POKE_FLUTE"
);





test(
    "Snorlax with Poké Flute",
    "Route12_EventScript_Snorlax"
);





//--------------------------------
// HM01
//--------------------------------


test(
    "Get HM01",
    "SSAnne_CaptainsOffice_EventScript_Captain"
);



test(
    "Get HM01 again",
    "SSAnne_CaptainsOffice_EventScript_Captain"
);