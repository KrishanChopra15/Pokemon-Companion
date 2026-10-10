/**
 * Pokémon Companion
 * Battle State Manager Test
 */

"use strict";


const BattleStateManager =
    require("../scripts/battle-state/battle-state-manager");



const manager =
    new BattleStateManager();



console.log(
    "Battle State Manager:",
    !!manager
);




//------------------------------
// Set Player
//------------------------------

const player =
    manager.setPlayer({

        species:
            "CHARMANDER",

        level:
            10

    });


console.log(
    "Set Player:",
    player.success
);





//------------------------------
// Set Enemy
//------------------------------

const enemy =
    manager.setEnemy({

        species:
            "PIDGEY",

        level:
            5

    });


console.log(
    "Set Enemy:",
    enemy.success
);





//------------------------------
// Turn
//------------------------------

const turn =
    manager.nextTurn();


console.log(
    "Turn:",
    turn.turn
);





//------------------------------
// Status
//------------------------------

const status =
    manager.setStatus(
        "PLAYER_TURN"
    );


console.log(
    "Status:",
    status.status
);





//------------------------------
// History
//------------------------------

const history =
    manager.addHistory({

        action:
            "EMBER"

    });


console.log(
    "History:",
    history.success
);





//------------------------------
// State
//------------------------------

const state =
    manager.getState();


console.log(
    "Player:",
    state.player.species
);


console.log(
    "Enemy:",
    state.enemy.species
);


console.log(
    "Turn:",
    state.turn
);


console.log(
    "History Count:",
    state.history.length
);





//------------------------------
// Clear
//------------------------------

const clear =
    manager.clear();


console.log(
    "Clear:",
    clear.success
);


console.log(
    "Has Player:",
    manager.getState().player !== null
);