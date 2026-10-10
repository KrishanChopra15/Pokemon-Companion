"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "NPC:",
    !!app.get(
        "npcService"
    )
);



console.log(
    "NPC Availability:",
    !!app.get(
        "npcAvailability"
    )
);



console.log(
    "NPC Interaction:",
    !!app.get(
        "npcInteraction"
    )
);



console.log(
    "Dialogue:",
    !!app.get(
        "dialogue"
    )
);