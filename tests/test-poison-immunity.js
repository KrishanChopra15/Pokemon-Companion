/**
 * Pokémon Companion
 * Poison Immunity Test
 */

"use strict";


const BattleSimulationService =
    require("../scripts/services/battle-simulation-service");


const StatusEffectService =
    require("../scripts/services/status-effect-service");



const statusService =
    new StatusEffectService();



const service =
    new BattleSimulationService(
        null,
        null,
        statusService
    );



console.log(
    "================================"
);

console.log(
    "Poison Immunity Test"
);

console.log(
    "================================"
);





const steelPokemon =
{

    species:
        "STEELIX",


    types:
        [
            "STEEL"
        ]

};





const poisonPokemon =
{

    species:
        "GRIMER",


    types:
        [
            "POISON"
        ]

};





console.log();


console.log(
    "Testing STEEL immunity..."
);


console.log(

    service.applyStatus(

        steelPokemon,

        {
            status:
                "POISON"
        }

    )

);





console.log();


console.log(
    "Testing POISON immunity..."
);


console.log(

    service.applyStatus(

        poisonPokemon,

        {
            status:
                "POISON"
        }

    )

);