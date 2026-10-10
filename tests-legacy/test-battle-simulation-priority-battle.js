/**
 * Pokémon Companion
 * Battle Simulation Priority Battle Test
 */

"use strict";


const BattleSimulationService =
    require("../scripts/services/battle-simulation-service");



console.log(
    "================================"
);

console.log(
    "Battle Simulation Priority Battle Test"
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









const pikachu = {


    species:
        "PIKACHU",


    level:
        20,


    hp:
        50,


    attack:
        35,


    defense:
        30,


    spAttack:
        40,


    spDefense:
        35,


    speed:
        50,


    types:
        [
            "ELECTRIC"
        ],


    moves:
        [

            {

                name:
                    "QUICK_ATTACK",

                type:
                    "NORMAL",

                category:
                    "PHYSICAL",

                power:
                    40,

                accuracy:
                    100,

                priority:
                    1

            }

        ]


};









const onix = {


    species:
        "ONIX",


    level:
        20,


    hp:
        60,


    attack:
        45,


    defense:
        100,


    spAttack:
        30,


    spDefense:
        40,


    speed:
        100,


    types:
        [

            "ROCK",

            "GROUND"

        ],


    moves:
        [

            {

                name:
                    "ROCK_THROW",

                type:
                    "ROCK",

                category:
                    "PHYSICAL",

                power:
                    50,

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

                    pikachu

                ]

        },


    opponent:
        {

            party:
                [

                    onix

                ]

        }


};









console.log();


console.log(
    "PIKACHU:"
);

console.log(
    pikachu
);



console.log();



console.log(
    "ONIX:"
);

console.log(
    onix
);









console.log();



console.log(
    "Testing Move Priority Order..."
);









const firstMove =

    service.determineFirstPokemon(

        pikachu,

        onix,

        pikachu.moves[0],

        onix.moves[0]

    );









console.log();



console.log(
    "First Move Result:"
);

console.log(
    firstMove
);









if(
    firstMove === "PLAYER"
)
{

    console.log(
        "PASS: QUICK_ATTACK moved first"
    );

}
else
{

    console.log(
        "FAIL: Priority system broken"
    );

}









console.log();



console.log(
    "Starting Priority Battle..."
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
    "Expected:"
);



console.log(
    "PLAYER should move first because QUICK_ATTACK priority is higher"
);



console.log(
    "Winner can be either side depending on damage calculation"
);









console.log();



console.log(
    "================================"
);


console.log(
    "Priority Battle Test Completed"
);


console.log(
    "================================"
);