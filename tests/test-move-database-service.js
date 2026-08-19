"use strict";


const MoveDatabaseService =
require("../scripts/services/move-database-service");



const moves =
new MoveDatabaseService();



console.log();


console.log(
"==============================="
);

console.log(
"Move Database Service Test"
);

console.log(
"==============================="
);



const ember =
moves.getMoveByConstant(
    "MOVE_EMBER"
);



console.log();


console.log(
"EMBER:"
);


console.log(
ember
);



const tackle =
moves.getMoveByName(
    "Tackle"
);



console.log();


console.log(
"Tackle:"
);


console.log(
tackle
);



console.log();


console.log(
"Total Moves:",
moves.getAllMoves().length
);


console.log();


console.log(
"Completed."
);