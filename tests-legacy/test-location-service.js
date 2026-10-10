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



console.log(
    "\nPikachu locations:"
);

console.log(
    locations.getPokemonLocations(
        "PIKACHU"
    )
);



console.log(
    "\nLocation count:"
);

console.log(
    locations.getAllLocations().length
);