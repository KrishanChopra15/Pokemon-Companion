/**
 * Pokémon Companion
 * Battle State Flow Test
 */

"use strict";


const BattleStateManager =
    require("../scripts/battle-state/battle-state-manager");


const BattleStateFlow =
    require("../scripts/battle-state/battle-state-flow");



const manager =
    new BattleStateManager();


const flow =
    new BattleStateFlow(
        manager
    );



console.log(
    "Battle State Flow:",
    !!flow
);





const player =
    flow.setPlayer({

        species:
            "PIKACHU",

        level:
            15

    });


console.log(
    "Player:",
    player.success
);





const enemy =
    flow.setEnemy({

        species:
            "RATTATA",

        level:
            3

    });


console.log(
    "Enemy:",
    enemy.success
);





const turn =
    flow.startTurn();


console.log(
    "Turn:",
    turn.turn
);





flow.record({

    action:
        "TACKLE"

});





const state =
    flow.getBattleState();



console.log(
    "Player Pokemon:",
    state.player.species
);


console.log(
    "Enemy Pokemon:",
    state.enemy.species
);


console.log(
    "History:",
    state.history.length
);