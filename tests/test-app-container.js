"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log();


console.log(
"==============================="
);

console.log(
"App Container Service Test"
);

console.log(
"==============================="
);





console.log();


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






//================================
// Move Services
//================================


console.log();


console.log(
"Move Services:"
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



console.log(
    "Move Replacement Selection:",
    !!app.get("moveReplacementSelection")
);



console.log(
    "Move Forget:",
    !!app.get("moveForget")
);






//================================
// Battle Support Services
//================================


console.log();


console.log(
"Battle Support Services:"
);



console.log(
    "Status Effect:",
    !!app.get("statusEffect")
);



console.log(
    "Stat Stage:",
    !!app.get("statStage")
);



console.log(
    "Pokemon Switch:",
    !!app.get("pokemonSwitch")
);







//================================
// Completed
//================================


console.log();


console.log(
"Completed."
);