/**
 * Pokémon Companion
 * Location Graph Service Test
 */

"use strict";


const LocationGraphService =
    require("../scripts/services/location-graph-service");


const graph =
    new LocationGraphService(
        "firered"
    );



console.log(
"================================"
);

console.log(
"Locations reachable from Pallet Town"
);

console.log(
"================================"
);



const locations =
    graph.getReachableLocations(
        "MAP_PALLET_TOWN"
    );



console.log(
"Count:",
locations.length
);



console.log();



console.log(
locations
);