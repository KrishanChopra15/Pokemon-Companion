"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Capture:",
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