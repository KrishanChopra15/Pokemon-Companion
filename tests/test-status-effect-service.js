/**
 * Pokémon Companion
 * Status Effect Service Test
 *
 * Tests:
 * - Apply status effects
 * - Remove status effects
 * - Check status
 * - Poison damage
 * - Toxic increasing damage
 * - Burn fixed damage
 * - Sleep duration
 * - Freeze thaw
 * - Paralysis action
 * - Status list
 */

"use strict";


const StatusEffectService =
    require("../scripts/services/status-effect-service");









//--------------------------------
// Service
//--------------------------------


const statusService =
    new StatusEffectService();









//--------------------------------
// Mock Pokemon
//--------------------------------


const pokemon =
{

    species:
        "CHARMANDER",


    level:
        10,


    hp:
        100,


    maxHP:
        100,


    status:
        null,


    statusTurns:
        0,


    statusData:
        {}

};









console.log();

console.log(
    "================================"
);

console.log(
    "Status Effect Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Status list
//--------------------------------


console.log();

console.log(
    "Available statuses:"
);


console.log(

    statusService.getAllStatuses()

);









//--------------------------------
// Poison
//--------------------------------


console.log();

console.log(
    "Applying Poison:"
);


console.log(

    statusService.applyStatus(

        pokemon,

        "POISON"

    )

);





console.log();

console.log(
    "Poison turn:"
);


console.log(

    statusService.processTurn(

        pokemon

    )

);





console.log();

console.log(
    "HP after Poison:"
);


console.log(

    pokemon.hp

);









//--------------------------------
// Remove
//--------------------------------


console.log();

console.log(
    "Removing status:"
);


console.log(

    statusService.removeStatus(

        pokemon

    )

);









//--------------------------------
// Toxic
//--------------------------------


pokemon.hp =
    100;


console.log();

console.log(
    "Applying Toxic:"
);


console.log(

    statusService.applyStatus(

        pokemon,

        "BADLY_POISONED"

    )

);





console.log();

console.log(
    "Toxic turn 1:"
);


console.log(

    statusService.processTurn(

        pokemon

    )

);





console.log();

console.log(
    "HP:"
);


console.log(
    pokemon.hp
);





console.log();

console.log(
    "Toxic turn 2:"
);


console.log(

    statusService.processTurn(

        pokemon

    )

);





console.log();

console.log(
    "HP:"
);


console.log(
    pokemon.hp
);





console.log();

console.log(
    "Toxic counter:"
);


console.log(

    pokemon.statusData

);









//--------------------------------
// Burn
//--------------------------------


pokemon.hp =
    100;


console.log();

console.log(
    "Applying Burn:"
);


console.log(

    statusService.applyStatus(

        pokemon,

        "BURN"

    )

);





console.log();

console.log(
    "Burn turn:"
);


console.log(

    statusService.processTurn(

        pokemon

    )

);





console.log();

console.log(
    "HP after Burn:"
);


console.log(

    pokemon.hp

);









//--------------------------------
// Sleep
//--------------------------------


console.log();

console.log(
    "Applying Sleep:"
);


console.log(

    statusService.applyStatus(

        pokemon,

        "SLEEP"

    )

);





console.log();

console.log(
    "Sleep turns:"
);


console.log(

    pokemon.statusTurns

);





console.log();

console.log(
    "Can Pokemon act while asleep:"
);


console.log(

    statusService.canAct(

        pokemon

    )

);





console.log();

console.log(
    "Sleep processing:"
);


console.log(

    statusService.processTurn(

        pokemon

    )

);









//--------------------------------
// Freeze
//--------------------------------


console.log();

console.log(
    "Applying Freeze:"
);


console.log(

    statusService.applyStatus(

        pokemon,

        "FREEZE"

    )

);





console.log();

console.log(
    "Freeze action check:"
);


console.log(

    statusService.canAct(

        pokemon

    )

);









//--------------------------------
// Paralysis
//--------------------------------


console.log();

console.log(
    "Applying Paralysis:"
);


console.log(

    statusService.applyStatus(

        pokemon,

        "PARALYSIS"

    )

);





console.log();

console.log(
    "Paralysis action check:"
);


console.log(

    statusService.canAct(

        pokemon

    )

);









//--------------------------------
// Final
//--------------------------------


console.log();

console.log(
    "Final Pokemon:"
);


console.log(

    pokemon

);









console.log();

console.log(
    "Status Effect Tests Completed."
);

console.log();