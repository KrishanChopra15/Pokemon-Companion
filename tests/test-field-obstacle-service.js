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
// No CUT ability
//--------------------------------


const noCutState =
    new TrainerState();





console.log();

console.log(
    "=== Can clear Pewter CUT without ability ==="
);


console.log(

    obstacles.canClearObstacleType(

        "MAP_PEWTER_CITY",

        "CUT",

        noCutState

    )

);









//--------------------------------
// Own HM item only
//--------------------------------


const hmOnlyState =
    new TrainerState();



hmOnlyState.addHM(
    "HM01_CUT"
);





console.log();

console.log(
    "=== Has HM01 but no CUT field ability ==="
);


console.log(

    obstacles.canClearObstacleType(

        "MAP_PEWTER_CITY",

        "CUT",

        hmOnlyState

    )

);









//--------------------------------
// CUT ability unlocked
//--------------------------------


const cutState =
    new TrainerState();



cutState.addHM(
    "HM01_CUT"
);



cutState.addBadge(
    "BOULDER_BADGE"
);



cutState.addHMAbility(
    "CUT"
);





console.log();

console.log(
    "=== Has CUT field ability ==="
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
    "=== Rock Smash without ability ==="
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
    "HM06_ROCK_SMASH"
);



rockSmashState.addBadge(
    "BOULDER_BADGE"
);



rockSmashState.addHMAbility(
    "ROCK_SMASH"
);





console.log();

console.log(
    "=== Rock Smash with ability ==="
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







console.log();

console.log(
    "Field obstacle tests completed."
);
