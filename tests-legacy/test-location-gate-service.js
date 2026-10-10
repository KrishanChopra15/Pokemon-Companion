/**
 * Pokémon Companion
 * Location Gate Service Test
 */

"use strict";


const LocationGateService =
    require("../scripts/services/location-gate-service");


const ProgressionService =
    require("../scripts/services/progression-service");


const TrainerState =
    require("../scripts/domain/trainer-state");



const progression =
    new ProgressionService();



const gates =
    new LocationGateService(
        "firered",
        progression
    );



console.log(
    "================================"
);

console.log(
    "Location Gate Service Test"
);

console.log(
    "================================"
);





//--------------------------------
// Empty trainer
//--------------------------------

const emptyState =
    new TrainerState();





//--------------------------------
// Flash trainer
//--------------------------------

const flashState =
    new TrainerState();


flashState.addHM(
    "FLASH"
);


flashState.addBadge(
    "BOULDER_BADGE"
);





//--------------------------------
// CUT without badge
//--------------------------------

const cutNoBadgeState =
    new TrainerState();


cutNoBadgeState.addHM(
    "CUT"
);





//--------------------------------
// CUT with badge
//--------------------------------

const cutState =
    new TrainerState();


cutState.addHM(
    "CUT"
);


cutState.addBadge(
    "BOULDER_BADGE"
);





//--------------------------------
// Rock Smash without HM
//--------------------------------

const noRockSmashState =
    new TrainerState();





//--------------------------------
// Rock Smash with HM
//--------------------------------

const rockSmashState =
    new TrainerState();


rockSmashState.addHM(
    "ROCK_SMASH"
);


rockSmashState.addBadge(
    "BOULDER_BADGE"
);







//================================
// Rock Tunnel Flash
//================================

console.log();

console.log(
    "=== Rock Tunnel without Flash ==="
);


console.log(
    gates.canEnter(
        "MAP_ROCK_TUNNEL_1F",
        emptyState
    )
);



console.log();

console.log(
    "Rock Tunnel warnings without Flash:"
);


console.log(
    JSON.stringify(
        gates.getWarnings(
            "MAP_ROCK_TUNNEL_1F",
            emptyState
        ),
        null,
        2
    )
);



console.log();

console.log(
    "=== Rock Tunnel with Flash ==="
);


console.log(
    gates.canEnter(
        "MAP_ROCK_TUNNEL_1F",
        flashState
    )
);







//================================
// CUT without badge
//================================

console.log();

console.log(
    "================================"
);

console.log(
    "Pewter City with CUT but no Boulder Badge"
);

console.log(
    "================================"
);


console.log(
    gates.canEnter(
        "MAP_PEWTER_CITY",
        cutNoBadgeState
    )
);







//================================
// CUT with badge
//================================

console.log();

console.log(
    "================================"
);

console.log(
    "Pewter City with CUT and Boulder Badge"
);

console.log(
    "================================"
);


console.log(
    gates.canEnter(
        "MAP_PEWTER_CITY",
        cutState
    )
);







//================================
// Rock Smash without HM
//================================

console.log();

console.log(
    "================================"
);

console.log(
    "Rock Tunnel B1F without Rock Smash"
);

console.log(
    "================================"
);


console.log(
    gates.canEnter(
        "MAP_ROCK_TUNNEL_B1F",
        noRockSmashState
    )
);







//================================
// Rock Smash with HM
//================================

console.log();

console.log(
    "================================"
);

console.log(
    "Rock Tunnel B1F with Rock Smash"
);

console.log(
    "================================"
);


console.log(
    gates.canEnter(
        "MAP_ROCK_TUNNEL_B1F",
        rockSmashState
    )
);