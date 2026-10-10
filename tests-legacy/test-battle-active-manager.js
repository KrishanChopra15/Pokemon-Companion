/**
 * Pokémon Companion
 * Battle Active Manager Test
 */

"use strict";



const BattleActiveManager =
    require("../scripts/battle-active/battle-active-manager");





const active =
    new BattleActiveManager();





console.log(
    "Battle Active Manager:",
    !!active
);





//--------------------------------
// Set Active
//--------------------------------


const result =
    active.setActive({

        species:
            "CHARMANDER",

        level:
            12,

        hp:
            39

    });





console.log(
    "Set Active:",
    result.success
);





console.log(
    "Pokemon:",
    active.getActive().species
);





console.log(
    "HP:",
    active.getActive().hp
);









//--------------------------------
// Damage
//--------------------------------


const damage =
    active.takeDamage(
        10
    );





console.log(
    "Damage:",
    damage.success
);





console.log(
    "HP After Damage:",
    active.getActive().hp
);









//--------------------------------
// Faint
//--------------------------------


active.takeDamage(
    100
);





console.log(
    "Fainted:",
    active.getActive().fainted
);









//--------------------------------
// Clear
//--------------------------------


const cleared =
    active.clear();





console.log(
    "Clear:",
    cleared.success
);





console.log(
    "Has Active:",
    !!active.getActive()
);