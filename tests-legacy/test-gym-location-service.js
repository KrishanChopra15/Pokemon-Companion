"use strict";


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const LocationGraphService =
    require("../scripts/services/location-graph-service");


const LocationGateService =
    require("../scripts/services/location-gate-service");


const FieldObstacleService =
    require("../scripts/services/field-obstacle-service");


const GymLocationService =
    require("../scripts/services/gym-location-service");



const gymProgression =
    new GymProgressionService();



const graph =
    new LocationGraphService(
        "firered"
    );



const gate =
    new LocationGateService(
        "firered"
    );



const obstacles =
    new FieldObstacleService(
        "firered"
    );



const locations =
    new GymLocationService(
        gymProgression,
        graph,
        gate,
        obstacles
    );



console.log(
    "================================"
);

console.log(
    "Gym Location Service Test"
);

console.log(
    "================================"
);



console.log();

console.log(
    "Locations before Brock (no HM moves):"
);



const beforeBrock =
    locations.getLocationsBeforeGym(
        "TRAINER_LEADER_BROCK",
        {
            moves:[]
        }
    );



console.log(
    beforeBrock.length
);



console.log();



console.log(
    "Locations before Brock:"
);


console.log(
    JSON.stringify(
        beforeBrock,
        null,
        2
    )
);



console.log();



console.log(
    "Rock Tunnel warnings without Flash:"
);



console.log(
    JSON.stringify(
        locations.getLocationWarnings(
            beforeBrock,
            {
                moves:[]
            }
        )
        .filter(
            entry =>
                entry.location ===
                "MAP_ROCK_TUNNEL_1F"
        ),
        null,
        2
    )
);



console.log();



console.log(
    "Locations before Brock with Cut:"
);



const beforeBrockWithCut =
    locations.getLocationsBeforeGym(
        "TRAINER_LEADER_BROCK",
        {
            moves:[
                "CUT"
            ]
        }
    );



console.log(
    beforeBrockWithCut.length
);