"use strict";


const MoveDatabaseService =
    require("../scripts/services/move-database-service");


const MoveLearningService =
    require("../scripts/services/move-learning-service");


const MoveReplacementService =
    require("../scripts/services/move-replacement-service");


const MoveReplacementSelectionService =
    require("../scripts/services/move-replacement-selection-service");


const MoveForgetService =
    require("../scripts/services/move-forget-service");



console.log();


console.log(
"==============================="
);

console.log(
"Move Learning Replacement Flow Test"
);

console.log(
"==============================="
);





//================================
// Services
//================================


const moveDatabase =
    new MoveDatabaseService(
        "firered"
    );



const moveReplacement =
    new MoveReplacementService();



const moveForget =
    new MoveForgetService();



const moveSelection =
    new MoveReplacementSelectionService(

        moveForget

    );



const moveLearning =
    new MoveLearningService(

        "firered",

        moveDatabase,

        moveReplacement,

        moveSelection,

        moveForget

    );








//================================
// Test Pokémon
//================================


const charmander =
{

    id:"0004",

    level:31,


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
"Current Moves:"
);


console.log(
    charmander.moves
);









//================================
// Find New Moves
//================================


const newMoves =
    moveLearning.getNewMoves(
        charmander
    );



const flamethrower =
    newMoves.find(

        entry =>

            entry.move.constant ===
            "MOVE_FLAMETHROWER"

    );





console.log();


console.log(
"Available New Moves:"
);


console.log(
    newMoves
);





if(!flamethrower)
{

    console.log();

    console.log(
        "Flamethrower not found"
    );


    process.exit();

}






console.log();


console.log(
"Learning:"
);


console.log(
    flamethrower.move
);









//================================
// Attempt Learning
//================================


const result =
    moveLearning.learnMove(

        charmander,

        flamethrower.move

    );





console.log();


console.log(
"Learning Result:"
);


console.log(
    result
);









//================================
// Replacement Selection
//================================


if(

    result.success === false

    &&

    result.reason === "Needs replacement"

)
{


    console.log();


    console.log(
    "Selecting Replacement:"
    );




    const replacement =
        moveSelection.replaceMove(

            charmander.moves,


            "MOVE_SCRATCH",


            {

                constant:
                    "MOVE_FLAMETHROWER",


                pp:
                    15

            }

        );





    console.log(
        replacement
    );



}









//================================
// Final Moves
//================================


console.log();


console.log(
"Final Moves:"
);


console.log(
    charmander.moves
);





console.log();


console.log(
"Completed."
);