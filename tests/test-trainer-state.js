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



state.addBadge(
    "BOULDER_BADGE"
);


state.addHM(
    "CUT"
);


state.addKeyItem(
    "SS_TICKET"
);


state.addStoryFlag(
    "SS_ANNE_DEPARTED"
);



console.log(
    state.getState()
);



console.log();


console.log(
    "Has Boulder Badge:"
);


console.log(
    state.hasBadge(
        "BOULDER_BADGE"
    )
);



console.log();


console.log(
    "Has Surf:"
);


console.log(
    state.hasHM(
        "SURF"
    )
);