"use strict";


const AppContainer =
    require("../scripts/app-container");


const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Progression:",
    !!app.get("progression")
);


console.log(
    "Progression Requirement:",
    !!app.get("progressionRequirement")
);


console.log(
    "Gym Progression:",
    !!app.get("gymProgression")
);


console.log(
    "Story Progression:",
    !!app.get("storyProgression")
);