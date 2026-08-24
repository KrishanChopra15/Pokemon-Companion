/**
 * Pokémon Companion
 * Battle Simulation Battle Log Test
 */

"use strict";


const BattleSimulationService =
    require("../scripts/services/battle-simulation-service");



console.log(
    "================================"
);

console.log(
    "Battle Simulation Battle Log Test"
);

console.log(
    "================================"
);





const service =
    new BattleSimulationService();





console.log(
    "Service Loaded:",
    service !== null
);









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
    "Starting Battle Log Simulation..."
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









console.log();



console.log(
    "Checking Battle Log..."
);









if(
    result.log
    &&
    Array.isArray(result.log)
)
{

    console.log(
        "PASS: Battle log exists"
    );



    console.log();



    console.log(
        "Log Entries:"
    );


    console.log(
        result.log
    );


}
else
{

    console.log(
        "FAIL: Battle log missing"
    );

}









console.log();



console.log(
    "Expected Log:"
);



console.log(
    "Turn actions should include:"
);



console.log(
    "- Attacker"
);



console.log(
    "- Move used"
);



console.log(
    "- Damage dealt"
);



console.log(
    "- Critical status"
);



console.log(
    "- Status effects"
);



console.log(
    "- Remaining HP"
);









console.log();



console.log(
    "================================"
);


console.log(
    "Battle Log Test Completed"
);


console.log(
    "================================"
);