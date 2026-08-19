"use strict";


const MoveReplacementSelectionService =
    require("../scripts/services/move-replacement-selection-service");



const service =
    new MoveReplacementSelectionService();





const charmander =
{

    moves:[

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

    ]

};






console.log();


console.log(
"==============================="
);

console.log(
"Move Replacement Selection Test"
);

console.log(
"==============================="
);





console.log();


console.log(
"Before:"
);


console.log(

    charmander.moves

);







console.log();


console.log(
"Replace Scratch with Flamethrower:"
);



console.log(

    service.replaceMove(

        charmander,

        "MOVE_SCRATCH",

        {
            constant:"MOVE_FLAMETHROWER",
            pp:15
        }

    )

);







console.log();


console.log(
"After:"
);



console.log(

    charmander.moves

);







console.log();


console.log(
"Completed."
);