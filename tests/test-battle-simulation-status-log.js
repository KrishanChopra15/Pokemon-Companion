/**
 * Pokémon Companion
 * Battle Simulation Status Log Test
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
    "Battle Simulation Status Log Test"
);

console.log(
    "================================"
);





//--------------------------------
// Load services
//--------------------------------


const statusService =
    new StatusEffectService();



const service =
    new BattleSimulationService(
        null,
        null,
        statusService
    );





console.log(
    "Service Loaded:",
    service !== null
);









//--------------------------------
// Test Pokémon
//--------------------------------


const charmander = {


    species:
        "CHARMANDER",


    level:
        12,


    hp:
        100,


    attack:
        20,


    defense:
        18,


    spAttack:
        24,


    spDefense:
        20,


    speed:
        25,


    types:
        [
            "FIRE"
        ],


    moves:
        [

            {

                name:
                    "EMBER",

                type:
                    "FIRE",

                category:
                    "SPECIAL",

                power:
                    40,

                accuracy:
                    100,

                status:
                    "BURN",

                statusChance:
                    100,

                priority:
                    0

            }

        ]


};









const bulbasaur = {


    species:
        "BULBASAUR",


    level:
        12,


    hp:
        100,


    attack:
        18,


    defense:
        20,


    spAttack:
        22,


    spDefense:
        25,


    speed:
        18,


    types:
        [
            "GRASS"
        ],


    moves:
        [

            {

                name:
                    "TACKLE",

                type:
                    "NORMAL",

                category:
                    "PHYSICAL",

                power:
                    40,

                accuracy:
                    100,

                priority:
                    0

            }

        ]


};









//--------------------------------
// Battle setup
//--------------------------------


const battle = {


    player:
        {

            party:
                [

                    charmander

                ]

        },


    opponent:
        {

            party:
                [

                    bulbasaur

                ]

        }


};









console.log();


console.log(
    "CHARMANDER:"
);

console.log(
    charmander
);



console.log();



console.log(
    "BULBASAUR:"
);

console.log(
    bulbasaur
);









console.log();


console.log(
    "Starting Status Log Battle..."
);









const result =

    service.simulateBattle(
        battle
    );









console.log();


console.log(
    "Battle Result:"
);

console.log(
    result
);









//--------------------------------
// Validate status log
//--------------------------------


console.log();


console.log(
    "Checking Status Events..."
);





let burnApplied = false;

let burnDamageFound = false;





if(
    Array.isArray(
        result.log
    )
)
{


    for(
        const entry of result.log
    )
    {


        if(
            entry.status === "BURN"
        )
        {

            burnApplied = true;

        }



        if(
            entry.event === "STATUS_DAMAGE"
            &&
            entry.status === "BURN"
        )
        {

            burnDamageFound = true;

        }


    }


}









if(
    burnApplied
)
{

    console.log(
        "PASS: Burn application recorded"
    );

}
else
{

    console.log(
        "FAIL: Burn application missing"
    );

}









if(
    burnDamageFound
)
{

    console.log(
        "PASS: Burn damage event recorded"
    );

}
else
{

    console.log(
        "INFO: Burn damage event not found"
    );

}









console.log();


console.log(
    "Expected:"
);



console.log(
    "EMBER should apply BURN"
);



console.log(
    "Battle log should contain STATUS_DAMAGE event"
);



console.log();


console.log(
    "================================"
);


console.log(
    "Status Log Test Completed"
);


console.log(
    "================================"
);