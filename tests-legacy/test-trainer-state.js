"use strict";


const TrainerState =
    require("../scripts/domain/trainer-state");



const state =
    new TrainerState();




console.log(
    "================================"
);

console.log(
    "Trainer State Test"
);

console.log(
    "================================"
);






//--------------------------------
// Badges
//--------------------------------


console.log();

console.log(
    "Adding Boulder Badge..."
);


state.addBadge(
    "BOULDER_BADGE"
);






//--------------------------------
// HM Items
//--------------------------------


console.log();

console.log(
    "Adding HM01 Cut..."
);


state.addHM(
    "HM01_CUT"
);





//--------------------------------
// HM Usage Ability
//--------------------------------


console.log();

console.log(
    "Unlocking Cut field ability..."
);


state.addHMAbility(
    "CUT"
);






//--------------------------------
// Key Items
//--------------------------------


console.log();

console.log(
    "Adding SS Ticket..."
);


state.addKeyItem(
    "SS_TICKET"
);






//--------------------------------
// Story Flags
//--------------------------------


console.log();

console.log(
    "Adding SS Anne departure flag..."
);


state.addStoryFlag(
    "SS_ANNE_DEPARTED"
);







//--------------------------------
// State Output
//--------------------------------


console.log();

console.log(
    "Trainer State:"
);


console.log(
    state.serialize()
);








//--------------------------------
// Badge Test
//--------------------------------


console.log();

console.log(
    "Has Boulder Badge:"
);


console.log(
    state.hasBadge(
        "BOULDER_BADGE"
    )
);








//--------------------------------
// HM Item Test
//--------------------------------


console.log();

console.log(
    "Has HM01 Cut:"
);


console.log(
    state.hasHM(
        "HM01_CUT"
    )
);








//--------------------------------
// HM Ability Test
//--------------------------------


console.log();

console.log(
    "Can use Cut in field:"
);


console.log(
    state.hasHMAbility(
        "CUT"
    )
);








//--------------------------------
// Missing HM Ability Test
//--------------------------------


console.log();

console.log(
    "Can use Surf in field:"
);


console.log(
    state.hasHMAbility(
        "SURF"
    )
);






console.log();

console.log(
    "Trainer State Test Completed."
);

console.log();