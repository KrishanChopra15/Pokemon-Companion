"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );





console.log(
    "Capture Service:",
    !!app.get(
        "captureService"
    )
);



console.log(
    "Wild Battle:",
    !!app.get(
        "wildBattleService"
    )
);



console.log(
    "Capture Manager:",
    !!app.get(
        "captureManager"
    )
);



console.log(
    "Capture Flow:",
    !!app.get(
        "captureFlow"
    )
);



console.log(
    "Team Flow:",
    !!app.get(
        "teamFlow"
    )
);



console.log(
    "Inventory Flow:",
    !!app.get(
        "inventoryFlow"
    )
);