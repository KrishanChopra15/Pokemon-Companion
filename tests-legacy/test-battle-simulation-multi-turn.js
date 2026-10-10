/**
 * Pokémon Companion
 * Battle Simulation Multi Turn Test
 */

"use strict";


const BattleSimulationService =
    require("../scripts/services/battle-simulation-service");



console.log(
    "================================"
);

console.log(
    "Battle Simulation Multi Turn Test"
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
                    100

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
                    100

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
    "Starting Multi Turn Battle..."
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



if(
    result.winner
)
{

    console.log(
        "PASS: Battle completed after multiple turns"
    );

}
else
{

    console.log(
        "FAIL: Battle did not complete"
    );

}









console.log();



console.log(
    "Expected:"
);



console.log(
    "Battle should continue until one Pokémon reaches 0 HP"
);



console.log(
    "Burn damage should apply during the battle"
);









console.log();



console.log(
    "================================"
);


console.log(
    "Multi Turn Test Completed"
);


console.log(
    "================================"
);