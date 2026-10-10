/**
 * Pokémon Companion
 * Map Access Service Test
 *
 * Tests:
 * - Location database
 * - Access requirements
 * - Badge requirements
 * - HM requirements
 * - Story requirements
 * - Location unlocking
 */

"use strict";


const MapAccessService =
    require("../scripts/services/map-access-service");


const TrainerState =
    require("../scripts/domain/trainer-state");







//--------------------------------
// Services
//--------------------------------


const maps =
    new MapAccessService();



const player =
    new TrainerState();









console.log();

console.log(
    "========================================"
);

console.log(
    "Map Access Service Tests"
);

console.log(
    "========================================"
);









//--------------------------------
// All locations
//--------------------------------


console.log();

console.log(
    "Total locations:"
);


console.log(

    maps.getAllLocations()
        .length

);









//--------------------------------
// New game
//--------------------------------


console.log();

console.log(
    "Available locations - new game:"
);


console.log(

    maps.getAvailableLocations(

        player

    )

);









//--------------------------------
// Basic locations
//--------------------------------


console.log();

console.log(
    "Can access Pallet Town:"
);


console.log(

    maps.canAccess(

        "PALLET_TOWN",

        player

    )

);





console.log();

console.log(
    "Can access Cerulean City:"
);


console.log(

    maps.canAccess(

        "CERULEAN_CITY",

        player

    )

);









//--------------------------------
// Boulder Badge
//--------------------------------


console.log();

console.log(
    "Adding Boulder Badge..."
);


player.addBadge(
    "BOULDER_BADGE"
);





console.log();

console.log(
    "Can access Mt Moon:"
);


console.log(

    maps.canAccess(

        "MT_MOON",

        player

    )

);







console.log();

console.log(
    "Can access Cerulean after Boulder:"
);


console.log(

    maps.canAccess(

        "CERULEAN_CITY",

        player

    )

);









//--------------------------------
// Cut progression
//--------------------------------


console.log();

console.log(
    "Vermilion without Cut:"
);


console.log(

    maps.canAccess(

        "VERMILION_CITY",

        player

    )

);







console.log();

console.log(
    "Adding Cut..."
);


player.addHMAbility(
    "CUT"
);







console.log();

console.log(
    "Vermilion with Cut:"
);


console.log(

    maps.canAccess(

        "VERMILION_CITY",

        player

    )

);









//--------------------------------
// Rock Tunnel
//--------------------------------


console.log();

console.log(
    "Rock Tunnel without Flash:"
);


console.log(

    maps.canAccess(

        "ROCK_TUNNEL",

        player

    )

);







console.log();

console.log(
    "Adding Flash..."
);


player.addHMAbility(
    "FLASH"
);







console.log();

console.log(
    "Rock Tunnel with Flash:"
);


console.log(

    maps.canAccess(

        "ROCK_TUNNEL",

        player

    )

);









//--------------------------------
// Saffron
//--------------------------------


console.log();

console.log(
    "Saffron before Silph Co:"
);


console.log(

    maps.canAccess(

        "SAFFRON_CITY",

        player

    )

);







console.log();

console.log(
    "Completing Silph Co..."
);


player.addStoryFlag(
    "SILPH_CO_COMPLETED"
);







console.log();

console.log(
    "Saffron after Silph Co:"
);


console.log(

    maps.canAccess(

        "SAFFRON_CITY",

        player

    )

);









//--------------------------------
// Cinnabar
//--------------------------------


console.log();

console.log(
    "Cinnabar without Surf:"
);


console.log(

    maps.canAccess(

        "CINNABAR_ISLAND",

        player

    )

);







console.log();

console.log(
    "Adding Surf..."
);


player.addHMAbility(
    "SURF"
);







console.log();

console.log(
    "Cinnabar with Surf:"
);


console.log(

    maps.canAccess(

        "CINNABAR_ISLAND",

        player

    )

);









//--------------------------------
// Unlock location
//--------------------------------


console.log();

console.log(
    "Unlocking Cinnabar:"
);


console.log(

    maps.unlockLocation(

        "CINNABAR_ISLAND",

        player

    )

);







console.log();

console.log(
    "Visited locations:"
);


console.log(

    player.visitedLocations

);









//--------------------------------
// Unknown location
//--------------------------------


console.log();

console.log(
    "Unknown location:"
);


console.log(

    maps.canAccess(

        "UNKNOWN_PLACE",

        player

    )

);









console.log();

console.log(
    "Map Access Service Tests Completed."
);

console.log();