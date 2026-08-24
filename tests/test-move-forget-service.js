"use strict";


const MoveForgetService =
    require("../scripts/services/move-forget-service");



console.log();


console.log(
"==============================="
);

console.log(
"Move Forget Service Test"
);

console.log(
"==============================="
);





const service =
    new MoveForgetService();






//================================
// Test Pokémon Moves
//================================


const moves =
[

    {
        constant:"MOVE_SCRATCH",
        currentPP:35,
        maxPP:35
    },


    {
        constant:"MOVE_EMBER",
        currentPP:25,
        maxPP:25
    },


    {
        constant:"MOVE_METAL_CLAW",
        currentPP:35,
        maxPP:35
    },


    {
        constant:"MOVE_SMOKESCREEN",
        currentPP:20,
        maxPP:20
    }

];








console.log();


console.log(
"Before:"
);


console.log(
    moves
);









//================================
// Forget Existing Move
//================================


console.log();


console.log(
"Forget MOVE_SCRATCH:"
);



const result =
    service.forgetMove(

        moves,

        "MOVE_SCRATCH"

    );



console.log(
    result
);








//================================
// After
//================================


console.log();


console.log(
"After:"
);



console.log(
    moves
);








//================================
// Invalid Move
//================================


console.log();


console.log(
"Forget Missing Move:"
);



const invalid =
    service.forgetMove(

        moves,

        "MOVE_UNKNOWN"

    );



console.log(
    invalid
);








console.log();


console.log(
"Completed."
);