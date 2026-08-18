"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Trainer Service:",
    !!app.get("trainerService")
);


console.log(
    "Battle Preparation:",
    !!app.get("battlePreparation")
);


console.log(
    "Battle Service:",
    !!app.get("battle")
);


console.log(
    "Battle AI:",
    !!app.get("battleAI")
);


console.log(
    "Battle Engine:",
    !!app.get("battleEngine")
);


console.log(
    "Evolution:",
    !!app.get("evolution")
);


console.log(
    "Experience:",
    !!app.get("experience")
);


console.log(
    "Level Up:",
    !!app.get("levelUp")
);