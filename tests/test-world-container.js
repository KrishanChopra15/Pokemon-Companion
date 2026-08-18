"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Location Graph:",
    !!app.get("locationGraph")
);


console.log(
    "Location Gate:",
    !!app.get("locationGate")
);


console.log(
    "Field Obstacle:",
    !!app.get("fieldObstacle")
);


console.log(
    "World State:",
    !!app.get("worldState")
);


console.log(
    "World Progression:",
    !!app.get("worldProgression")
);


console.log(
    "Objective:",
    !!app.get("objective")
);