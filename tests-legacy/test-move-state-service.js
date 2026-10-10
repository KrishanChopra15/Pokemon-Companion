"use strict";


const MoveStateService =
    require("../scripts/services/move-state-service");





const service =
    new MoveStateService();





console.log();


console.log(
"==============================="
);

console.log(
"Move State Service Test"
);

console.log(
"==============================="
);









const pikachu =
{

    id:
        25,

    species:
        "Pikachu"

};









//================================
// Rollout Test
//================================


console.log();


console.log(
"Rollout:"
);



console.log(
    "Start:"
);



console.log(

    service.startRollout(
        pikachu
    )

);



console.log(
    "Turn 2:"
);



console.log(

    service.continueRollout(
        pikachu
    )

);



console.log(
    "Turn 3:"
);



console.log(

    service.continueRollout(
        pikachu
    )

);



console.log(
    "Turn 4:"
);



console.log(

    service.continueRollout(
        pikachu
    )

);



console.log(
    "Reset Rollout:"
);



console.log(

    service.resetRollout(
        pikachu
    )

);









//================================
// Fury Cutter Test
//================================


console.log();


console.log(
"Fury Cutter:"
);



console.log(
    "Start:"
);



console.log(

    service.startFuryCutter(
        pikachu
    )

);



console.log(
    "Hit 2:"
);



console.log(

    service.continueFuryCutter(
        pikachu
    )

);



console.log(
    "Hit 3:"
);



console.log(

    service.continueFuryCutter(
        pikachu
    )

);



console.log(
    "Reset Fury Cutter:"
);



console.log(

    service.resetFuryCutter(
        pikachu
    )

);









//================================
// Rage Test
//================================


console.log();


console.log(
"Rage:"
);



console.log(

    service.activateRage(
        pikachu
    )

);



console.log(

    service.isRageActive(
        pikachu
    )

);



console.log(

    service.resetRage(
        pikachu
    )

);



console.log(

    service.isRageActive(
        pikachu
    )

);









//================================
// Bide Test
//================================


console.log();


console.log(
"Bide:"
);



console.log(

    service.startBide(
        pikachu
    )

);



console.log(

    service.storeBideDamage(

        pikachu,

        40

    )

);



console.log(

    service.storeBideDamage(

        pikachu,

        30

    )

);



console.log(

    service.continueBide(
        pikachu
    )

);



console.log(
"Release:"
);



console.log(

    service.releaseBide(
        pikachu
    )

);









//================================
// Completed
//================================


console.log();


console.log(
"Completed."
);