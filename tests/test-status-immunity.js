/**
 * Pokémon Companion
 * Status Immunity Test
 */

"use strict";


const BattleSimulationService =
    require("../scripts/services/battle-simulation-service");


const StatusEffectService =
    require("../scripts/services/status-effect-service");



console.log(
    "================================"
);

console.log(
    "Status Immunity Test"
);

console.log(
    "================================"
);





const statusService =
    new StatusEffectService();



const service =
    new BattleSimulationService(
        null,
        null,
        statusService
    );





const charmander =
{

    species:
        "CHARMANDER",


    types:
        [
            "FIRE"
        ]

};





console.log();


console.log(
    "Testing FIRE type burn immunity..."
);





const result =

    service.applyStatus(

        charmander,

        {
            status:
                "BURN"
        }

    );





console.log(
    result
);





if(
    result.success === false
)
{

    console.log(
        "PASS: Fire type cannot be burned"
    );

}
else
{

    console.log(
        "FAIL: Fire type received burn"
    );

}





console.log();


console.log(
    "================================"
);

console.log(
    "Status Immunity Test Completed"
);

console.log(
    "================================"
);