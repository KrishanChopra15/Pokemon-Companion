/**
 * Pokémon Companion
 * Battle Service Test
 *
 * Tests:
 * - Trainer battle creation
 * - Battle storage
 * - Active tracking
 * - Victory completion
 * - Battle removal
 */

"use strict";


const BattleService =
    require("../scripts/services/battle-service");









//--------------------------------
// Mock preparation
//--------------------------------


const battlePreparation =
{

    prepareTrainerBattle(
        trainerId,
        playerState
    )
    {


        return {

            success:true,


            battleType:
                "TRAINER",


            trainer:
            {

                id:
                    trainerId,


                name:
                    trainerId

            },


            player:
            {

                party:
                    playerState.party

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
                            40,


                        maxHP:
                            40

                    }

                ]

            }

        };


    }

};









//--------------------------------
// Mock engine
//--------------------------------


const battleEngine =
{

    initializeBattle(
        battle
    )
    {

        console.log(

            "Engine initialized:",
            battle.id

        );

    }

};









//--------------------------------
// Mock progression
//--------------------------------


const progression =
{

    processProgression()
    {

        return {};

    }

};









const experience =
{

    calculateExp()
    {

        return 100;

    }

};









const rewards =
{};









//--------------------------------
// Service
//--------------------------------


const battleService =
    new BattleService(

        battlePreparation,

        battleEngine,

        progression,

        experience,

        rewards

    );









const player =
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

        }

    ]

};









console.log();

console.log(
"================================"
);

console.log(
"Battle Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Start battle
//--------------------------------


console.log();

console.log(
"Starting trainer battle:"
);



const result =
    battleService.startTrainerBattle(

        "BROCK",

        player

    );



console.log(result);









const battleId =
    result.battleId;









console.log();

console.log(
"Battle ID:"
);


console.log(battleId);









//--------------------------------
// Get battle
//--------------------------------


console.log();

console.log(
"Loaded battle:"
);


console.log(

    battleService.getBattle(

        battleId

    )

);









//--------------------------------
// Active
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









//--------------------------------
// Active battles
//--------------------------------


console.log();

console.log(
"Active battles:"
);


console.log(

    battleService.getActiveBattles()

);









//--------------------------------
// Win
//--------------------------------


console.log();

console.log(
"Winning battle:"
);



console.log(

    battleService.winBattle(

        battleId

    )

);









//--------------------------------
// Completed state
//--------------------------------


console.log();

console.log(
"After victory:"
);


console.log(

    battleService.getBattle(

        battleId

    )

);









console.log();

console.log(
"Active after victory:"
);



console.log(

    battleService.isActive(

        battleId

    )

);









//--------------------------------
// Count
//--------------------------------


console.log();

console.log(
"Battle count:"
);


console.log(

    battleService.getBattleCount()

);









//--------------------------------
// Clear
//--------------------------------


console.log();

console.log(
"Clear battle:"
);



console.log(

    battleService.clearBattle(

        battleId

    )

);









console.log();

console.log(
"Battle count after clear:"
);



console.log(

    battleService.getBattleCount()

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Service Tests Completed."
);

console.log(
"================================"
);

console.log();