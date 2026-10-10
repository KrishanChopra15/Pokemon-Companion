"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Trainer Analysis:",
    !!app.get("trainerAnalysis")
);


console.log(
    "Trainer Difficulty:",
    !!app.get("trainerDifficulty")
);


console.log(
    "Trainer Recommendation:",
    !!app.get("trainerRecommendation")
);