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

console.log(
    "Move DB:",
    !!app.get("moveDatabase")
);


console.log(
    "Move Machine:",
    !!app.get("moveMachine")
);


console.log(
    "Move Learning:",
    !!app.get("moveLearning")
);


console.log(
    "Move Replacement:",
    !!app.get("moveReplacement")
);