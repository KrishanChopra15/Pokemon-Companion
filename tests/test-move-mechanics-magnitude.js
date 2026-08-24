"use strict";


const MoveMechanicsService =
    require("../scripts/services/move-mechanics-service");





const service =
    new MoveMechanicsService(
        "firered"
    );







console.log();


console.log(
"==============================="
);

console.log(
"Magnitude Move Mechanics Test"
);

console.log(
"==============================="
);









//================================
// Magnitude Move
//================================


const magnitude =
{

    constant:
        "MOVE_MAGNITUDE"

};









//================================
// Multiple Rolls
//================================


console.log();


console.log(
"Magnitude Results:"
);



for(
    let i = 0;
    i < 10;
    i++
)
{


    console.log(

        service.resolveMove(

            magnitude

        )

    );


}









//================================
// Magnitude Table
//================================


console.log();


console.log(
"Magnitude Power Table:"
);



console.log(

    service.magnitudeTable

);









console.log();


console.log(
"Completed."
);