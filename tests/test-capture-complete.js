"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



const inventory =
    app.get(
        "inventoryFlow"
    );



const capture =
    app.get(
        "captureFlow"
    );



inventory.receiveItem(
    "POKE_BALL",
    5
);



console.log(
    "Pokeballs Before:",
    inventory.getQuantity(
        "POKE_BALL"
    )
);



const result =
    capture.confirmCapture({

        species:
            "RATTATA",

        level:
            3,

        location:
            "MAP_ROUTE1"

    });



console.log(
    "Capture Success:",
    result.success
);



console.log(
    "Pokeballs After:",
    inventory.getQuantity(
        "POKE_BALL"
    )
);



console.log(
    "Stored:",
    result.capture.species
);



console.log(
    "Team:",
    result.team
);



console.log(
    "Action:",
    Boolean(result.action)
);