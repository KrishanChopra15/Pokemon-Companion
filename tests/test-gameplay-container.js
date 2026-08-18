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