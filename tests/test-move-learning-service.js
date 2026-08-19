"use strict";


const MoveLearningService =
require("../scripts/services/move-learning-service");


const MoveReplacementService =
require("../scripts/services/move-replacement-service");



const replacement =
new MoveReplacementService();



const service =
new MoveLearningService(
    "firered",
    null,
    replacement
);





console.log();


console.log(
"==============================="
);

console.log(
"Move Learning Service Test"
);

console.log(
"==============================="
);







//================================
// Test 1
// Available level moves
//================================


const charmander =
{

    id:"0004",

    level:16,

    moves:[

        {
            constant:"MOVE_SCRATCH"
        },

        {
            constant:"MOVE_GROWL"
        }

    ]

};





console.log();


console.log(
"Learnset:"
);


console.log(

    service.getLearnset(
        charmander.id
    )

);





console.log();


console.log(
"Available Moves:"
);


console.log(

    service.getAvailableMoves(
        charmander
    )

);





console.log();


console.log(
"New Moves:"
);


console.log(

    service.getNewMoves(
        charmander
    )

);





console.log();


console.log(
"Learn Available Moves:"
);


console.log(

    service.learnAvailableMoves(
        charmander
    )

);





console.log();


console.log(
"Current Moves:"
);


console.log(
    charmander.moves
);









//================================
// Test 2
// Full moves replacement
//================================


const fullCharmander =
{

    id:"0004",

    level:31,

    moves:[

        {
            constant:"MOVE_SCRATCH"
        },

        {
            constant:"MOVE_GROWL"
        },

        {
            constant:"MOVE_EMBER"
        },

        {
            constant:"MOVE_METAL_CLAW"
        }

    ]

};





console.log();


console.log(
"==============================="
);

console.log(
"Full Move Replacement Test"
);

console.log(
"==============================="
);



console.log();


console.log(
"New Moves:"
);



console.log(

    service.getNewMoves(
        fullCharmander
    )

);





console.log();


console.log(
"Learn Flamethrower:"
);



console.log(

    service.learnAvailableMoves(
        fullCharmander
    )

);





console.log();


console.log(
"Completed."
);