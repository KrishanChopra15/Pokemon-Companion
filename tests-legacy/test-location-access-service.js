/**
 * Pokémon Companion
 * Location Access Service Test
 */

"use strict";


const LocationGraphService =
    require("../scripts/services/location-graph-service");


const FieldObstacleService =
    require("../scripts/services/field-obstacle-service");


const LocationGateService =
    require("../scripts/services/location-gate-service");


const ProgressionService =
    require("../scripts/services/progression-service");


const LocationAccessService =
    require("../scripts/services/location-access-service");


const TrainerState =
    require("../scripts/domain/trainer-state");





const graph =
    new LocationGraphService(
        "firered"
    );



const obstacles =
    new FieldObstacleService(
        "firered"
    );



const gates =
    new LocationGateService(
        "firered"
    );



const progression =
    new ProgressionService();




const access =
    new LocationAccessService(
        graph,
        obstacles,
        gates,
        progression
    );





console.log(
    "================================"
);

console.log(
    "Location Access Service Test"
);

console.log(
    "================================"
);





//--------------------------------
// No CUT
//--------------------------------

const noCutState =
    new TrainerState();



console.log();

console.log(
    "=== Pewter City without CUT ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_PEWTER_CITY",
            "MAP_PALLET_TOWN",
            noCutState
        ),
        null,
        4
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
    "=== Pewter City with CUT but no Boulder Badge ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_PEWTER_CITY",
            "MAP_PALLET_TOWN",
            cutNoBadgeState
        ),
        null,
        4
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
    "=== Pewter City with CUT and Boulder Badge ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_PEWTER_CITY",
            "MAP_PALLET_TOWN",
            cutState
        ),
        null,
        4
    )
);







//--------------------------------
// Blocked obstacles
//--------------------------------

console.log();

console.log(
    "=== Pewter blocked obstacles without CUT ==="
);


console.log(
    JSON.stringify(
        access.getBlockedObstacles(
            "MAP_PEWTER_CITY",
            noCutState
        ),
        null,
        4
    )
);







//--------------------------------
// Route 10 without CUT
//--------------------------------

console.log();

console.log(
    "=== Route 10 without CUT ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_ROUTE10",
            "MAP_PALLET_TOWN",
            noCutState
        ),
        null,
        4
    )
);







//--------------------------------
// Route 10 with CUT
//--------------------------------

console.log();

console.log(
    "=== Route 10 with CUT ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_ROUTE10",
            "MAP_PALLET_TOWN",
            cutState
        ),
        null,
        4
    )
);







//--------------------------------
// S.S Anne before departure
//--------------------------------

const ssAnneState =
    new TrainerState();


ssAnneState.addKeyItem(
    "SS_TICKET"
);



console.log();

console.log(
    "=== S.S Anne before departure ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_SSANNE_EXTERIOR",
            "MAP_PALLET_TOWN",
            ssAnneState
        ),
        null,
        4
    )
);







//--------------------------------
// S.S Anne after departure
//--------------------------------

ssAnneState.addStoryFlag(
    "SS_ANNE_DEPARTED"
);



console.log();

console.log(
    "=== S.S Anne after departure ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_SSANNE_EXTERIOR",
            "MAP_PALLET_TOWN",
            ssAnneState
        ),
        null,
        4
    )
);



//--------------------------------
// Victory Road without 8 badges
//--------------------------------

const noEightBadgeState =
    new TrainerState();


console.log();

console.log(
    "=== Victory Road without 8 badges ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_VICTORY_ROAD_1F",
            "MAP_PALLET_TOWN",
            noEightBadgeState
        ),
        null,
        4
    )
);





//--------------------------------
// Victory Road with 8 badges
//--------------------------------

const eightBadgeState =
    new TrainerState();


eightBadgeState.badges = [

    "BOULDER_BADGE",
    "CASCADE_BADGE",
    "THUNDER_BADGE",
    "RAINBOW_BADGE",
    "SOUL_BADGE",
    "MARSH_BADGE",
    "VOLCANO_BADGE",
    "EARTH_BADGE"

];


console.log();

console.log(
    "=== Victory Road with 8 badges ==="
);


console.log(
    JSON.stringify(
        access.analyzeLocation(
            "MAP_VICTORY_ROAD_1F",
            "MAP_PALLET_TOWN",
            eightBadgeState
        ),
        null,
        4
    )
);