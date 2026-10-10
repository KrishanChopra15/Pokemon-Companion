/**
 * Pokémon Companion
 * Battle State Service Test
 *
 * Tests:
 * - Initialize battle state
 * - Update external state flow
 * - Send out player Pokémon
 * - Send out opponent Pokémon
 * - Invalid battle handling
 * - Missing party handling
 */

"use strict";


const BattleStateService =
    require("../scripts/services/battle-state-service");









//--------------------------------
// Mock flows
//--------------------------------


const battleStateFlow =
{

    player:
        null,


    enemy:
        null,


    setPlayer(
        pokemon
    )
    {

        this.player =
            pokemon;

    },


    setEnemy(
        pokemon
    )
    {

        this.enemy =
            pokemon;

    }

};









const battleActiveFlow =
{

    active:
        null,


    sendOut(
        pokemon
    )
    {

        this.active =
            pokemon;

    }

};









const battleOpponentFlow =
{

    active:
        null,


    sendOut(
        pokemon
    )
    {

        this.active =
            pokemon;

    }

};









const stateService =
    new BattleStateService(

        battleStateFlow,

        battleActiveFlow,

        battleOpponentFlow

    );









console.log();

console.log(
"================================"
);

console.log(
"Battle State Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Mock battle
//--------------------------------


const battle =
{

    id:
        "STATE_TEST_1",


    status:
        "ACTIVE",


    player:
    {

        party:
        [

            {

                species:
                    "CHARMANDER",


                hp:
                    39

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
                    40

            }

        ]

    }

};









//--------------------------------
// Initialize
//--------------------------------


console.log();

console.log(
"Initialize battle state:"
);



console.log(

    stateService.initialize(

        battle

    )

);









//--------------------------------
// Check state flow
//--------------------------------


console.log();

console.log(
"State flow:"
);



console.log(

    {

        player:

            battleStateFlow.player
            ?
            battleStateFlow.player.species
            :
            null,


        enemy:

            battleStateFlow.enemy
            ?
            battleStateFlow.enemy.species
            :
            null

    }

);









//--------------------------------
// Active flow
//--------------------------------


console.log();

console.log(
"Active Pokémon flow:"
);



console.log(

    {

        playerActive:

            battleActiveFlow.active
            ?
            battleActiveFlow.active.species
            :
            null,


        opponentActive:

            battleOpponentFlow.active
            ?
            battleOpponentFlow.active.species
            :
            null

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

    stateService.initialize(

        null

    )

);









//--------------------------------
// Missing party
//--------------------------------


console.log();

console.log(
"Missing party:"
);



console.log(

    stateService.initialize(

        {

            id:
                "INVALID_TEST",


            player:
            {},


            opponent:
            {}

        }

    )

);









console.log();

console.log(
"================================"
);

console.log(
"Battle State Service Tests Completed."
);

console.log(
"================================"
);

console.log();