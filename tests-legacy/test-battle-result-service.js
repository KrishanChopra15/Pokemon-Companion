/**
 * Pokémon Companion
 * Battle Result Service Test
 *
 * Tests:
 * - Player victory
 * - Opponent victory
 * - Active battle
 * - Finished check
 * - Invalid battle handling
 */

"use strict";


const BattleResultService =
    require("../scripts/services/battle-result-service");



const resultService =
    new BattleResultService();









console.log();

console.log(
"================================"
);

console.log(
"Battle Result Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Player wins
//--------------------------------


console.log();

console.log(
"Player victory:"
);



const playerWinBattle =
{

    status:
        "ACTIVE",


    winner:
        null,


    player:
    {

        party:
        [

            {

                species:
                    "CHARMANDER",

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

                hp:
                    0

            }

        ]

    }

};









console.log(

    resultService.checkBattleEnd(

        playerWinBattle

    )

);



console.log(

    {

        status:
            playerWinBattle.status,


        winner:
            playerWinBattle.winner,


        finished:

            resultService.isFinished(

                playerWinBattle

            )

    }

);









//--------------------------------
// Opponent wins
//--------------------------------


console.log();

console.log(
"Opponent victory:"
);



const opponentWinBattle =
{

    status:
        "ACTIVE",


    winner:
        null,


    player:
    {

        party:
        [

            {

                species:
                    "CHARMANDER",

                hp:
                    0

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

                hp:
                    30

            }

        ]

    }

};









console.log(

    resultService.checkBattleEnd(

        opponentWinBattle

    )

);



console.log(

    {

        status:
            opponentWinBattle.status,


        winner:
            opponentWinBattle.winner,


        finished:

            resultService.isFinished(

                opponentWinBattle

            )

    }

);









//--------------------------------
// Battle continues
//--------------------------------


console.log();

console.log(
"Battle active:"
);



const activeBattle =
{

    status:
        "ACTIVE",


    winner:
        null,


    player:
    {

        party:
        [

            {

                hp:
                    30

            }

        ]

    },


    opponent:
    {

        party:
        [

            {

                hp:
                    20

            }

        ]

    }

};









console.log(

    resultService.checkBattleEnd(

        activeBattle

    )

);



console.log(

    {

        status:
            activeBattle.status,


        winner:
            activeBattle.winner

    }

);









//--------------------------------
// Invalid battle
//--------------------------------


console.log();

console.log(
"Invalid battle:"
);



console.log(

    resultService.checkBattleEnd(

        null

    )

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Result Service Tests Completed."
);

console.log(
"================================"
);

console.log();