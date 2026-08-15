/**
 * Pokémon Companion
 * Field Obstacle Service Test
 */

"use strict";


const FieldObstacleService =
    require("../scripts/services/field-obstacle-service");


const ProgressionService =
    require("../scripts/services/progression-service");


const TrainerState =
    require("../scripts/domain/trainer-state");





const progression =
    new ProgressionService();



const obstacles =
    new FieldObstacleService(
        "firered",
        progression
    );





console.log(
    "================================"
);

console.log(
    "Field Obstacle Service Test"
);

console.log(
    "================================"
);







console.log();

console.log(
    "=== Pewter City Obstacles ==="
);


console.log(
    JSON.stringify(
        obstacles.getObstacles(
            "MAP_PEWTER_CITY"
        ),
        null,
        4
    )
);







console.log();

console.log(
    "=== Route 10 Obstacles ==="
);


console.log(
    JSON.stringify(
        obstacles.getObstacles(
            "MAP_ROUTE10"
        ),
        null,
        4
    )
);







console.log();

console.log(
    "=== Has Pewter CUT obstacle? ==="
);


console.log(
    obstacles.hasObstacle(
        "MAP_PEWTER_CITY",
        "CUT"
    )
);







//--------------------------------
// No CUT
//--------------------------------

const noCutState =
    new TrainerState();





console.log();

console.log(
    "=== Can clear Pewter CUT without CUT ==="
);


console.log(
    obstacles.canClearObstacleType(
        "MAP_PEWTER_CITY",
        "CUT",
        noCutState
    )
);







//--------------------------------
// CUT without badge
//--------------------------------

const cutNoBadgeState =
    new TrainerState();


cutNoBadgeState.addHM(
    "CUT"
);





console.log();

console.log(
    "=== Can clear Pewter CUT with CUT but no Boulder Badge ==="
);


console.log(
    obstacles.canClearObstacleType(
        "MAP_PEWTER_CITY",
        "CUT",
        cutNoBadgeState
    )
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





console.log();

console.log(
    "=== Can clear Pewter CUT with CUT and Boulder Badge ==="
);


console.log(
    obstacles.canClearObstacleType(
        "MAP_PEWTER_CITY",
        "CUT",
        cutState
    )
);







//--------------------------------
// Rock Smash
//--------------------------------

console.log();

console.log(
    "=== Rock Smash without HM ==="
);


console.log(
    obstacles.canClearObstacleType(
        "MAP_ROCK_TUNNEL_B1F",
        "ROCK_SMASH",
        noCutState
    )
);







const rockSmashState =
    new TrainerState();


rockSmashState.addHM(
    "ROCK_SMASH"
);


rockSmashState.addBadge(
    "BOULDER_BADGE"
);





console.log();

console.log(
    "=== Rock Smash with HM ==="
);


console.log(
    obstacles.canClearObstacleType(
        "MAP_ROCK_TUNNEL_B1F",
        "ROCK_SMASH",
        rockSmashState
    )
);







//--------------------------------
// Direct obstacle object
//--------------------------------

console.log();

console.log(
    "=== Direct obstacle object check ==="
);


console.log(
    obstacles.canClearObstacle(
        "MAP_ROUTE10",
        {
            type:"CUT"
        },
        cutState
    )
);