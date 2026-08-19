/**
 * Pokémon Companion
 * Battle Active Flow Test
 */

"use strict";


const BattleActiveManager =
    require("../scripts/battle-active/battle-active-manager");


const BattleActiveFlow =
    require("../scripts/battle-active/battle-active-flow");





const manager =
    new BattleActiveManager();



const flow =
    new BattleActiveFlow(
        manager,
        null
    );





console.log(
    "Battle Active Flow:",
    !!flow
);





//--------------------------------
// Send Out
//--------------------------------


const send =
    flow.sendOut({

        species:
            "PIKACHU",

        level:
            15,

        hp:
            45

    });





console.log(
    "Send Out:",
    send.success
);





console.log(
    "Active Pokemon:",
    flow.getActive().species
);





console.log(
    "Level:",
    flow.getActive().level
);









//--------------------------------
// Switch
//--------------------------------


const switched =
    flow.switchPokemon({

        species:
            "BULBASAUR",

        level:
            10,

        hp:
            35

    });





console.log(
    "Switch:",
    switched.success
);





console.log(
    "Current:",
    flow.getActive().species
);









//--------------------------------
// Status
//--------------------------------


const status =
    flow.getStatus();





console.log(
    "Has Active:",
    status.hasActive
);