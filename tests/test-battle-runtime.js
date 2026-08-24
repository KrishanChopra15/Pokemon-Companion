/**
 * Pokémon Companion
 * Battle Runtime Test
 *
 * Tests:
 * - App container battle services
 * - Trainer lookup
 * - Battle creation
 * - Engine initialization
 * - Turn processing
 * - State synchronization
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");





const app =
    new AppContainer();









//--------------------------------
// Services
//--------------------------------


const trainerService =
    app.get(
        "trainerService"
    );


const battleService =
    app.get(
        "battle"
    );


const battleEngine =
    app.get(
        "battleEngine"
    );


const battleState =
    app.get(
        "battleStateFlow"
    );









console.log();

console.log(
"================================"
);

console.log(
"Battle Runtime Tests"
);

console.log(
"================================"
);









console.log();

console.log(
"Services:"
);



console.log(

    {

        trainerService:
            !!trainerService,


        battleService:
            !!battleService,


        battleEngine:
            !!battleEngine,


        battleState:
            !!battleState

    }

);









//--------------------------------
// Trainer database check
//--------------------------------


console.log();

console.log(
"Trainer count:"
);



console.log(

    trainerService.count()

);









console.log();

console.log(
"Brock lookup:"
);



console.log(

    trainerService.getTrainer(

        "BROCK"

    )

);









//--------------------------------
// Player
//--------------------------------


const player =
{

    pokemon:
    [

        {

            species:
                "CHARMANDER",


            level:
                10,


            hp:
                39,


            maxHP:
                39,


            attack:
                52,


            defense:
                43,


            spAttack:
                60,


            spDefense:
                50,


            speed:
                45,


            types:
            [

                "FIRE"

            ],


            moves:
            [

                {

                    name:
                        "EMBER",


                    constant:
                        "MOVE_EMBER",


                    type:
                        "FIRE",


                    category:
                        "SPECIAL",


                    power:
                        40,


                    accuracy:
                        100,


                    pp:
                        25,


                    maxPP:
                        25,


                    priority:
                        0

                }

            ]

        }

    ]

};









//--------------------------------
// Create battle
//--------------------------------


console.log();

console.log(
"Creating battle:"
);



const battleResult =

    battleService.startTrainerBattle(

        "BROCK",

        player

    );



console.log(

    JSON.stringify(

        battleResult,

        null,

        4

    )

);









if(
    !battleResult.success
)
{

    console.log();

    console.log(
        "Battle creation failed"
    );


    process.exit();

}









const battleId =

    battleResult.battleId;









console.log();

console.log(
"Battle ID:"
);



console.log(

    battleId

);









//--------------------------------
// Loaded battle
//--------------------------------


const battle =

    battleService.getBattle(

        battleId

    );



console.log();

console.log(
"Battle state:"
);



console.log(

    {

        id:
            battle.id,


        status:
            battle.status,


        player:
            battle.player.party[0].species,


        opponent:
            battle.opponent.party[0].species

    }

);









//--------------------------------
// State synchronization
//--------------------------------


console.log();

console.log(
"Battle state flow:"
);



if(
    battleState
)
{

    console.log(

        battleState.getState

        ?

        battleState.getState()

        :

        "State flow available"

    );

}









//--------------------------------
// Process turn
//--------------------------------


console.log();

console.log(
"Processing turn:"
);



const turnResult =

    battleEngine.processTurn(

        battleId,

        battle.player.party[0].moves[0]

    );



console.log(

    JSON.stringify(

        turnResult,

        null,

        4

    )

);









//--------------------------------
// Turn result
//--------------------------------


console.log();

console.log(
"Turn summary:"
);



if(
    turnResult.success
)
{

    console.log(

        {

            turn:
                turnResult.result.turn,


            actions:
                turnResult.result.actions.length

        }

    );

}









//--------------------------------
// Active check
//--------------------------------


console.log();

console.log(
"Battle active:"
);



console.log(

    battleService.isActive(

        battleId

    )

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Runtime Tests Completed."
);

console.log(
"================================"
);

console.log();