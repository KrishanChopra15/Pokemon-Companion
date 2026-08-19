"use strict";


const MoveReplacementService =
    require("../scripts/services/move-replacement-service");


const PokemonMoveSlot =
    require("../scripts/domain/pokemon-move-slot");



const service =
    new MoveReplacementService();



console.log();


console.log(
"==============================="
);

console.log(
"Move Replacement Service Test"
);

console.log(
"==============================="
);

console.log();





//================================
// Test 1
// Add move with empty slots
//================================


let moves = [

    new PokemonMoveSlot({

        constant:
            "MOVE_SCRATCH",

        currentPP:
            35,

        maxPP:
            35

    }),


    new PokemonMoveSlot({

        constant:
            "MOVE_EMBER",

        currentPP:
            25,

        maxPP:
            25

    })

];



const metalClaw = {

    constant:
        "MOVE_METAL_CLAW",

    pp:
        35

};





console.log(
"Add Metal Claw:"
);


console.log(

    service.addMove(

        moves,

        metalClaw

    )

);



console.log();


console.log(
"Current Moves:"
);


console.log(
    moves
);








//================================
// Test 2
// Full move slots
//================================


moves = [

    new PokemonMoveSlot({

        constant:
            "MOVE_SCRATCH",

        currentPP:
            35,

        maxPP:
            35

    }),


    new PokemonMoveSlot({

        constant:
            "MOVE_EMBER",

        currentPP:
            25,

        maxPP:
            25

    }),


    new PokemonMoveSlot({

        constant:
            "MOVE_METAL_CLAW",

        currentPP:
            35,

        maxPP:
            35

    }),


    new PokemonMoveSlot({

        constant:
            "MOVE_SMOKESCREEN",

        currentPP:
            20,

        maxPP:
            20

    })

];



const flamethrower = {

    constant:
        "MOVE_FLAMETHROWER",

    pp:
        15

};





console.log();


console.log(
"Replacement Options:"
);


console.log(

    service.getReplacementOptions(

        moves,

        flamethrower

    )

);









//================================
// Test 3
// Replace move
//================================



console.log();


console.log(
"Replace Scratch with Flamethrower:"
);



console.log(

    service.replaceMove(

        moves,

        "MOVE_SCRATCH",

        flamethrower

    )

);





console.log();


console.log(
"Final Moves:"
);


console.log(
    moves
);





console.log();


console.log(
"Completed."
);