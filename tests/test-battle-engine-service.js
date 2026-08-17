/**
 * Pokémon Companion
 * Battle Engine Service Test
 *
 * Tests:
 * - Battle initialization
 * - Active Pokémon selection
 * - Turn processing
 * - Move execution
 * - Damage delegation
 * - Faint detection
 * - Auto switching
 * - Battle outcome
 */

"use strict";



const BattleEngineService =
    require("../scripts/services/battle-engine-service");


const MoveExecutionService =
    require("../scripts/services/move-execution-service");


const PokemonSwitchService =
    require("../scripts/services/pokemon-switch-service");









//--------------------------------
// Services
//--------------------------------


const moveExecutionService =
    new MoveExecutionService();



const pokemonSwitchService =
    new PokemonSwitchService();



const battleEngine =
    new BattleEngineService(

        moveExecutionService,

        pokemonSwitchService

    );









//--------------------------------
// Mock battle
//--------------------------------


const battle =
{

    id:
        "BATTLE_TEST_1",



    player:
    {

        party:
        [

            {

                species:
                    "CHARMANDER",

                level:
                    10,

                hp:
                    39

            },


            {

                species:
                    "PIKACHU",

                level:
                    12,

                hp:
                    40

            }

        ]

    },





    opponent:
    {

        party:
        [

            {

                species:
                    "GEODUDE",

                level:
                    12,

                hp:
                    30

            },


            {

                species:
                    "ONIX",

                level:
                    14,

                hp:
                    40

            }

        ]

    }

};









console.log();

console.log(
    "================================"
);

console.log(
    "Battle Engine Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Initialize
//--------------------------------


console.log();

console.log(
    "Initializing battle:"
);


console.log(

    battleEngine.initializeBattle(

        battle

    )

);









//--------------------------------
// Loaded state
//--------------------------------


console.log();

console.log(
    "Loaded battle:"
);


console.log(

    battleEngine.getBattle(

        "BATTLE_TEST_1"

    )

);









//--------------------------------
// First turn
//--------------------------------


console.log();

console.log(
    "Processing first turn:"
);


console.log(

    battleEngine.processTurn(

        "BATTLE_TEST_1",


        {

            name:
                "EMBER",

            power:
                40,

            accuracy:
                100

        },


        {

            name:
                "TACKLE",

            power:
                35,

            accuracy:
                100

        }

    )

);









//--------------------------------
// Battle state
//--------------------------------


console.log();

console.log(
    "Battle after first turn:"
);


console.log(

    battleEngine.getBattle(

        "BATTLE_TEST_1"

    )

);









//--------------------------------
// Continue battle
//--------------------------------


console.log();

console.log(
    "Continuing battle:"
);



for(
    let i = 0;
    i < 5;
    i++
)
{

    console.log(

        battleEngine.processTurn(

            "BATTLE_TEST_1",


            {

                name:
                    "EMBER",

                power:
                    40,

                accuracy:
                    100

            },


            {

                name:
                    "TACKLE",

                power:
                    35,

                accuracy:
                    100

            }

        )

    );


}









//--------------------------------
// Final state
//--------------------------------


console.log();

console.log(
    "Final battle state:"
);


console.log(

    battleEngine.getBattle(

        "BATTLE_TEST_1"

    )

);









//--------------------------------
// Winner
//--------------------------------


console.log();

console.log(
    "Battle winner:"
);


console.log(

    battleEngine.getBattle(

        "BATTLE_TEST_1"

    )
    .winner

);









console.log();

console.log(
    "Battle Engine Tests Completed."
);

console.log();