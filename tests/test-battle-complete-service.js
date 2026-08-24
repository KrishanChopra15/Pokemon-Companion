/**
 * Pokémon Companion
 * Battle Complete Service Test
 *
 * Tests:
 * - Pokémon faint detection
 * - Trainer defeat
 * - Battle winner
 * - Battle completion
 */

"use strict";


const BattleFaintService =
    require("../scripts/services/battle-faint-service");


const PokemonSwitchService =
    require("../scripts/services/pokemon-switch-service");





console.log();

console.log(
"================================"
);

console.log(
"Battle Complete Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Mock services
//--------------------------------


const pokemonService =
{

    getActivePokemon(side)
    {

        return side.party[
            side.active
        ];

    }

};









const switchService =

    new PokemonSwitchService();









const faintService =

    new BattleFaintService(

        pokemonService,

        switchService

    );









//--------------------------------
// Battle mock
//--------------------------------


const battle =
{

    id:
        "COMPLETE_TEST",


    status:
        "ACTIVE",


    turn:
        5,


    player:
    {

        trainer:
            "PLAYER",


        active:
            0,


        party:
        [

            {

                species:
                    "CHARMANDER",

                hp:
                    40,

                maxHP:
                    40

            }

        ]

    },


    opponent:
    {

        trainer:
            "BROCK",


        active:
            0,


        party:
        [

            {

                species:
                    "GEODUDE",

                hp:
                    0,

                maxHP:
                    30

            }

        ]

    },


    winner:
        null

};









//--------------------------------
// Handle faint
//--------------------------------


console.log();

console.log(
"Handling faint:"
);



const result =
{

    actions:
        []

};





const fainted =

    faintService.handleFaint(

        battle.opponent,

        result

    );









console.log(

    {

        fainted,


        actions:
            result.actions

    }

);









//--------------------------------
// Battle completion simulation
//--------------------------------


console.log();

console.log(
"Completing battle:"
);



battle.status =
    "FINISHED";


battle.winner =
    "PLAYER";









console.log(

    {

        winner:
            battle.winner,


        status:
            battle.status

    }

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Complete Service Tests Completed."
);

console.log(
"================================"
);