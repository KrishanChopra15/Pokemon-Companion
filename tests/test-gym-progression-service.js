"use strict";


const GymProgressionService =
    require("../scripts/services/gym-progression-service");



const gyms =
    new GymProgressionService();



console.log(
    "All gyms:"
);


console.log(
    gyms.getAllGyms()
);



console.log();


console.log(
    "Brock:"
);


console.log(
    gyms.getGym(
        "TRAINER_LEADER_BROCK"
    )
);



console.log();


console.log(
    "Before Misty:"
);


console.log(
    gyms.getPreviousGyms(
        "TRAINER_LEADER_MISTY"
    )
);