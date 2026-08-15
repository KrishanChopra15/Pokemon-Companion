/**
 * Pokémon Companion
 * Location Database Service Test
 */

"use strict";


const LocationDatabaseService =
    require("../scripts/services/location-database-service");



const locations =
    new LocationDatabaseService(
        "firered"
    );



console.log(
    "Viridian Forest:"
);


console.log(
    locations.getLocation(
        "MAP_VIRIDIAN_FOREST"
    )
);



console.log();


console.log(
    "Pikachu Locations:"
);


console.log(
    locations.getPokemonLocations(
        "PIKACHU"
    )
);



console.log();


console.log(
    "Total Locations:"
);


console.log(
    locations.getAllLocations()
        .length
);



console.log();


console.log(
    "Total Pokemon With Locations:"
);


console.log(
    locations.getPokemonCount()
);

console.log();


console.log(
    "Pokémon in Viridian Forest:"
);


console.log(
    locations.getPokemonInLocation(
        "MAP_VIRIDIAN_FOREST"
    )
);