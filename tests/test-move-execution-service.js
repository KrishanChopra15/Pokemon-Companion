/**
 * Pokémon Companion
 * Move Execution Service Test
 *
 * Tests:
 * - Move execution
 * - Damage calculation
 * - Accuracy
 * - HP reduction
 * - Faint detection
 * - Result summary
 */

"use strict";



const MoveExecutionService =
    require("../scripts/services/move-execution-service");






//--------------------------------
// Service
//--------------------------------


const moveService =
    new MoveExecutionService();









console.log();

console.log(
    "================================"
);

console.log(
    "Move Execution Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Pokemon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",

    level:
        10,

    hp:
        39

};





const geodude =
{

    species:
        "GEODUDE",

    level:
        12,

    hp:
        40

};









//--------------------------------
// Move
//--------------------------------


const ember =
{

    name:
        "EMBER",

    power:
        40,

    accuracy:
        100

};









//--------------------------------
// Execute
//--------------------------------


console.log();

console.log(
    "Executing Ember:"
);


const result =
    moveService.executeMove(

        charmander,

        geodude,

        ember

    );



console.log(
    result
);









//--------------------------------
// HP check
//--------------------------------


console.log();

console.log(
    "Geodude HP after attack:"
);


console.log(

    geodude.hp

);









//--------------------------------
// Faint check
//--------------------------------


console.log();

console.log(
    "Geodude fainted:"
);


console.log(

    moveService.isFainted(

        geodude

    )

);









//--------------------------------
// Damage calculation
//--------------------------------


console.log();

console.log(
    "Damage calculation:"
);


console.log(

    moveService.calculateDamage(

        charmander,

        geodude,

        ember

    )

);









//--------------------------------
// Summary
//--------------------------------


console.log();

console.log(
    "Battle summary:"
);


console.log(

    moveService.getResultSummary(

        charmander,

        geodude,

        ember,

        result

    )

);









//--------------------------------
// Miss test
//--------------------------------


console.log();

console.log(
    "Testing miss:"
);


const missMove =
{

    name:
        "TAIL_WHIP",

    power:
        0,

    accuracy:
        0

};



console.log(

    moveService.executeMove(

        charmander,

        geodude,

        missMove

    )

);









console.log();

console.log(
    "Move Execution Tests Completed."
);

console.log();