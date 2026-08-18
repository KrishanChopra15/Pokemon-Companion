"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Pokemon DB:",
    !!app.get("pokemonDatabase")
);


console.log(
    "Trainer DB:",
    !!app.get("trainerDatabase")
);


console.log(
    "Location DB:",
    !!app.get("locationDatabase")
);


console.log(
    "Gym DB:",
    !!app.get("gymDatabase")
);