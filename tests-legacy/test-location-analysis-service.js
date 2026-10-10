/**
 * Pokémon Companion
 * Location Analysis Service Test
 */

"use strict";


const LocationDatabaseService =
    require("../scripts/services/location-database-service");


const LocationAnalysisService =
    require("../scripts/services/location-analysis-service");



const locationDatabase =
    new LocationDatabaseService(
        "firered"
    );



const analysis =
    new LocationAnalysisService(
        locationDatabase
    );



const earlyGameLocations = [
    "MAP_ROUTE_1",
    "MAP_ROUTE2",
    "MAP_VIRIDIAN_FOREST"
];


const mtMoonLocations = [
    "MAP_ROUTE4",
    "MAP_MT_MOON_1F",
    "MAP_MT_MOON_B1F"
];



console.log(
    "================================"
);

console.log(
    "Location Analysis Service Test"
);

console.log(
    "================================"
);



console.log();

console.log(
    "Pokémon before Mt Moon area:"
);


console.log(
    JSON.stringify(
        analysis.getPokemonAvailableInLocations(
            earlyGameLocations
        ),
        null,
        4
    )
);



console.log();

console.log(
    "Count:"
);


console.log(
    analysis.getPokemonCountInLocations(
        earlyGameLocations
    )
);



console.log();

console.log(
    "Pikachu locations:"
);


console.log(
    JSON.stringify(
        analysis.getLocationsContainingPokemon(
            "PIKACHU"
        ),
        null,
        4
    )
);



console.log();

console.log(
    "================================"
);

console.log(
    "Comparison"
);

console.log(
    "================================"
);



console.log();

console.log(
    "Common Pokémon between early game and Mt Moon:"
);


console.log(
    JSON.stringify(
        analysis.getCommonPokemon(
            earlyGameLocations,
            mtMoonLocations
        ),
        null,
        4
    )
);



console.log();

console.log(
    "New Pokémon after reaching Mt Moon:"
);


console.log(
    JSON.stringify(
        analysis.getNewPokemon(
            earlyGameLocations,
            mtMoonLocations
        ),
        null,
        4
    )
);