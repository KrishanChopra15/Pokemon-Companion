"use strict";


const TrainerState =
require("../scripts/domain/trainer-state");


const ProgressionService =
require("../scripts/services/progression-service");



const state =
new TrainerState();



const progression =
new ProgressionService();



console.log(
"================================"
);

console.log(
"Progression Service Test"
);

console.log(
"================================"
);



state.addHM(
"CUT"
);



console.log();


console.log(
"Use CUT before Boulder Badge:"
);


console.log(
progression.canUseHM(
    "CUT",
    state
)
);



state.addBadge(
"BOULDER_BADGE"
);



console.log();


console.log(
"Use CUT after Boulder Badge:"
);


console.log(
progression.canUseHM(
    "CUT",
    state
)
);



state.addStoryFlag(
"SS_ANNE_DEPARTED"
);



console.log();


console.log(
"SS Anne departed:"
);


console.log(
progression.hasStoryRequirement(
    "SS_ANNE_DEPARTED",
    state
)
);