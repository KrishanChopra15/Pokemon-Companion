/**
 * Pokémon Companion
 * Battle Turn Order Service Test
 *
 * Tests:
 * - Priority moves
 * - Speed based ordering
 * - Speed ties
 * - Paralysis speed reduction
 * - Stat stage speed changes
 */

"use strict";





const BattleTurnOrderService =
    require("../scripts/services/battle-turn-order-service");









console.log();

console.log(
"================================"
);

console.log(
"Battle Turn Order Service Tests"
);

console.log(
"================================"
);









const turnOrder =
    new BattleTurnOrderService();









//--------------------------------
// Moves
//--------------------------------


const tackle =
{

    name:
        "TACKLE",


    priority:
        0

};





const quickAttack =
{

    name:
        "QUICK_ATTACK",


    priority:
        1

};









//--------------------------------
// Helper battle
//--------------------------------


function createBattle(
    playerSpeed,
    enemySpeed
)
{

    return {

        player:
        {

            active:
                0,


            party:
            [

                {

                    species:
                        "PIKACHU",


                    speed:
                        playerSpeed

                }

            ]

        },



        opponent:
        {

            active:
                0,


            party:
            [

                {

                    species:
                        "GEODUDE",


                    speed:
                        enemySpeed

                }

            ]

        }

    };

}









//--------------------------------
// Speed test
//--------------------------------


console.log();

console.log(
"Faster Pokémon moves first:"
);



let result =

    turnOrder.getTurnOrder(

        createBattle(

            90,

            20

        ),

        tackle,

        tackle

    );









console.log(

    result.map(

        action =>

            action.move.name

    )

);









//--------------------------------
// Priority test
//--------------------------------


console.log();

console.log(
"Priority move test:"
);



result =

    turnOrder.getTurnOrder(

        createBattle(

            50,

            200

        ),

        quickAttack,

        tackle

    );









console.log(

    result.map(

        action =>

            action.move.name

    )

);









//--------------------------------
// Enemy priority test
//--------------------------------


console.log();

console.log(
"Enemy priority test:"
);



result =

    turnOrder.getTurnOrder(

        createBattle(

            200,

            50

        ),

        tackle,

        quickAttack

    );









console.log(

    result.map(

        action =>

            action.move.name

    )

);









//--------------------------------
// Paralysis test
//--------------------------------


console.log();

console.log(
"Paralysis speed reduction:"
);



const paralysisBattle =
{

    player:
    {

        active:
            0,


        party:
        [

            {

                species:
                    "PIKACHU",


                speed:
                    100,


                status:
                    "PARALYSIS"

            }

        ]

    },


    opponent:
    {

        active:
            0,


        party:
        [

            {

                species:
                    "GEODUDE",


                speed:
                    50

            }

        ]

    }

};









result =

    turnOrder.getTurnOrder(

        paralysisBattle,

        tackle,

        tackle

    );









console.log(

    result.map(

        action =>

            action.side ===

            paralysisBattle.player

            ?

            "PLAYER"

            :

            "OPPONENT"

    )

);









//--------------------------------
// Stat stage test
//--------------------------------


console.log();

console.log(
"Speed stage boost:"
);



const boostedBattle =
{

    player:
    {

        active:
            0,


        party:
        [

            {

                species:
                    "PIKACHU",


                speed:
                    50,


                statStages:
                {

                    speed:
                        2

                }

            }

        ]

    },


    opponent:
    {

        active:
            0,


        party:
        [

            {

                species:
                    "GEODUDE",


                speed:
                    80

            }

        ]

    }

};









result =

    turnOrder.getTurnOrder(

        boostedBattle,

        tackle,

        tackle

    );









console.log(

    result.map(

        action =>

            action.side === boostedBattle.player

            ?

            "PLAYER"

            :

            "OPPONENT"

    )

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Turn Order Service Tests Completed."
);

console.log(
"================================"
);