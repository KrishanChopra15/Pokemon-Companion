/**
 * Pokémon Companion
 * Battle Flow Service Test
 *
 * Tests:
 * - Turn processing
 * - Move validation
 * - AI move selection
 * - Turn execution
 * - Result generation
 * - Battle completion
 */

"use strict";





const BattleFlowService =
    require("../scripts/services/battle-flow-service");



const BattleValidationService =
    require("../scripts/services/battle-validation-service");


const BattleTurnOrderService =
    require("../scripts/services/battle-turn-order-service");


const BattleTurnService =
    require("../scripts/services/battle-turn-service");


const BattleFaintService =
    require("../scripts/services/battle-faint-service");


const BattleResultService =
    require("../scripts/services/battle-result-service");


const BattlePokemonService =
    require("../scripts/services/battle-pokemon-service");


const MoveExecutionService =
    require("../scripts/services/move-execution-service");


const MoveMechanicsService =
    require("../scripts/services/move-mechanics-service");


const MoveEffectService =
    require("../scripts/services/move-effect-service");


const DamageCalculationService =
    require("../scripts/services/damage-calculation-service");


const MoveDatabaseService =
    require("../scripts/services/move-database-service");


const StatStageService =
    require("../scripts/services/stat-stage-service");


const TypeEffectivenessService =
    require("../scripts/services/type-effectiveness-service");


const PokemonSwitchService =
    require("../scripts/services/pokemon-switch-service");


const StatusEffectService =
    require("../scripts/services/status-effect-service");





console.log();

console.log(
"================================"
);

console.log(
"Battle Flow Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Services
//--------------------------------


const validationService =

    new BattleValidationService();



const turnOrderService =

    new BattleTurnOrderService();



const statusService =
    new StatusEffectService();


const statStageService =
    new StatStageService();


const moveDatabaseService =
    new MoveDatabaseService();


const moveMechanicsService =
    new MoveMechanicsService(

        "firered",

        moveDatabaseService

    );


const moveEffectService =
    new MoveEffectService(

        statStageService,

        statusService

    );


const typeEffectivenessService =
    new TypeEffectivenessService();



const damageCalculationService =

    new DamageCalculationService(

        typeEffectivenessService,

        statusService

    );



const moveExecutionService =

    new MoveExecutionService(

        moveMechanicsService,

        moveEffectService,

        damageCalculationService,

        statusService

    );



const turnService =

    new BattleTurnService(

        moveExecutionService,

        statusService,

        null

    );





const faintService =

    new BattleFaintService(

        new PokemonSwitchService()

    );





const resultService =

    new BattleResultService();





const pokemonService =

    new BattlePokemonService();









//--------------------------------
// Mock AI
//--------------------------------


const battleAIService =
{

    chooseMove(
        pokemon,
        target,
        moves
    )
    {

        return moves[0];

    }

};









//--------------------------------
// Battle Flow
//--------------------------------


const battleFlow =

    new BattleFlowService(

        validationService,

        turnOrderService,

        turnService,

        faintService,

        resultService,

        pokemonService,

        battleAIService

    );









//--------------------------------
// Mock battle
//--------------------------------


const battle =
{


    id:

        "FLOW_TEST",



    status:

        "ACTIVE",



    turn:

        1,



    player:
    {


        active:

            0,



        party:
        [

 {

    species:
        "CHARMANDER",

    level:
        12,

    hp:
        50,

    maxHP:
        50,

    attack:
        20,

    defense:
        18,

    spAttack:
        24,

    spDefense:
        20,

    speed:
        60,

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
                10

        }

    ]

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

    level:
        12,

    hp:
        40,

    maxHP:
        40,

    attack:
        25,

    defense:
        30,

    spAttack:
        15,

    spDefense:
        20,

    speed:
        20,

    types:
        [
            "ROCK",
            "GROUND"
        ],


    moves:
    [

        {

            name:
                "TACKLE",

            constant:
                "MOVE_TACKLE",

            type:
                "NORMAL",

            category:
                "PHYSICAL",

            power:
                35,

            accuracy:
                95,

            pp:
                10

        }

    ]

}


        ]


    }


};









//--------------------------------
// Process turn
//--------------------------------


console.log();


console.log(
"Processing turn:"
);





const result =

    battleFlow.processTurn(

        battle,

        {


            name:

                "EMBER",



            constant:

                "MOVE_EMBER"



        }

    );









console.log();



console.log(

    JSON.stringify(

        result,

        null,

        4

    )

);









//--------------------------------
// Assertions
//--------------------------------


console.log();


console.log(
"Checking results:"
);





console.log(

    {


        success:

            result.success,



        playerHP:

            battle.player.party[0].hp,



        enemyHP:

            battle.opponent.party[0].hp,



        turn:

            battle.turn



    }

);









//--------------------------------
// Invalid move
//--------------------------------


console.log();


console.log(
"Invalid move test:"
);





const invalid =

    battleFlow.processTurn(

        battle,

        {


            name:

                "FLY",



            constant:

                "MOVE_FLY"



        }

    );









console.log(

    JSON.stringify(

        invalid,

        null,

        4

    )

);









console.log();


console.log(
"================================"
);

console.log(
"Battle Flow Service Tests Completed."
);

console.log(
"================================"
);