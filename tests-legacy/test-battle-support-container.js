"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Move Execution:",
    !!app.get("moveExecution")
);



console.log(
    "Status Effect:",
    !!app.get("statusEffect")
);



console.log(
    "Pokemon Switch:",
    !!app.get("pokemonSwitch")
);