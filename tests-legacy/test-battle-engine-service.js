/**
 * Pokémon Companion
 * Battle Engine Service Test
 *
 * Tests:
 * - Battle initialization
 * - Battle retrieval
 * - Turn forwarding
 * - Active Pokémon access
 * - Full battle flow integration
 */

"use strict";





const BattleEngineService =
    require("../scripts/services/battle-engine-service");


const BattleStateService =
    require("../scripts/services/battle-state-service");


const BattlePokemonService =
    require("../scripts/services/battle-pokemon-service");


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


const PokemonSwitchService =
    require("../scripts/services/pokemon-switch-service");


const MoveExecutionService =
    require("../scripts/services/move-execution-service");


const DamageCalculationService =
    require("../scripts/services/damage-calculation-service");


const TypeEffectivenessService =
    require("../scripts/services/type-effectiveness-service");


const StatusEffectService =
    require("../scripts/services/status-effect-service");





const {
    createBattle
}
=
require("./helpers/mock-battle");









console.log();

console.log(
"================================"
);


console.log(
"Battle Engine Service Tests"
);


console.log(
"================================"
);









//--------------------------------
// Services
//--------------------------------


const battleStateService =

    new BattleStateService();




const battlePokemonService =

    new BattlePokemonService();





const validationService =

    new BattleValidationService();





const turnOrderService =

    new BattleTurnOrderService();





const statusService =

    new StatusEffectService();





const typeEffectivenessService =

    new TypeEffectivenessService();





const damageCalculationService =

    new DamageCalculationService(

        typeEffectivenessService,

        statusService

    );





const moveExecutionService =

    new MoveExecutionService(

        null,

        null,

        damageCalculationService,

        statusService

    );





const battleTurnService =

    new BattleTurnService(

        moveExecutionService,

        statusService,

        null

    );





const battleFaintService =

    new BattleFaintService(

        new PokemonSwitchService()

    );





const battleResultService =

    new BattleResultService();









//--------------------------------
// AI
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


const battleFlowService =

    new BattleFlowService(

        validationService,

        turnOrderService,

        battleTurnService,

        battleFaintService,

        battleResultService,

        battlePokemonService,

        battleAIService

    );









//--------------------------------
// Engine
//--------------------------------


const battleEngine =

    new BattleEngineService(

        battleStateService,

        battleFlowService,

        battlePokemonService

    );









//--------------------------------
// Initialize battle
//--------------------------------


console.log();

console.log(
"Initialize battle:"
);



const battle =

    createBattle();





console.log(

    JSON.stringify(

        battleEngine.initializeBattle(

            battle

        ),

        null,

        4

    )

);









//--------------------------------
// Get battle
//--------------------------------


console.log();

console.log(
"Get battle:"
);



console.log(

    JSON.stringify(

        battleEngine.getBattle(

            battle.id

        ),

        null,

        4

    )

);









//--------------------------------
// Active Pokémon
//--------------------------------


console.log();

console.log(
"Active player Pokémon:"
);



console.log(

    battleEngine.getPlayerActive(

        battle.id

    )

);









console.log();

console.log(
"Active opponent Pokémon:"
);



console.log(

    battleEngine.getOpponentActive(

        battle.id

    )

);









//--------------------------------
// Process turn
//--------------------------------


console.log();

console.log(
"Process turn:"
);



console.log(

    JSON.stringify(

        battleEngine.processTurn(

            battle.id,

            {

                name:
                    "EMBER",

                constant:
                    "MOVE_EMBER"

            }

        ),

        null,

        4

    )

);









//--------------------------------
// Unknown battle
//--------------------------------


console.log();

console.log(
"Unknown battle:"
);



console.log(

    JSON.stringify(

        battleEngine.processTurn(

            "UNKNOWN",

            {

                name:
                    "EMBER",

                constant:
                    "MOVE_EMBER"

            }

        ),

        null,

        4

    )

);









console.log();

console.log(
"================================"
);


console.log(
"Battle Engine Service Tests Completed."
);


console.log(
"================================"
);