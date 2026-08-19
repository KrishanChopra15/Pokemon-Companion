"use strict";


const MoveMachineService =
require("../scripts/services/move-machine-service");


const MoveDatabaseService =
require("../scripts/services/move-database-service");




//================================
// Dependencies
//================================


const moveDatabase =
new MoveDatabaseService();




const service =
new MoveMachineService(

    "firered",

    moveDatabase

);





console.log();


console.log(
"==============================="
);

console.log(
"Move Machine Service Test"
);

console.log(
"==============================="
);



console.log();


console.log(
"Can Charmander learn Flamethrower?"
);



console.log(

service.canLearn(

    "CHARMANDER",

    "TM35_FLAMETHROWER"

)

);



console.log();


console.log(
"Teach Flamethrower:"
);



console.log(

service.teachMove(

    "CHARMANDER",

    "TM35_FLAMETHROWER"

)

);



console.log();


console.log(
"Completed."
);