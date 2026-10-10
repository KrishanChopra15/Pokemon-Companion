/**
 * Pokémon Companion
 * Runtime World Test
 *
 * Tests:
 * - Runtime creation.
 * - World movement.
 * - Location updates.
 * - Visited location tracking.
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");


const GameRuntime =
    require("../scripts/runtime/game-runtime");





const container =
    new AppContainer();



const runtime =
    new GameRuntime(
        container
    );





//--------------------------------
// Start
//--------------------------------


runtime.start();



console.log(
    "Runtime World:",
    Boolean(runtime)
);





//--------------------------------
// Starting location
//--------------------------------


console.log(
    "Start Location:",
    runtime.getCurrentLocation()
);





//--------------------------------
// Move
//--------------------------------


const move =
    runtime.moveTo(
        "MAP_VIRIDIAN_CITY"
    );



console.log(
    "Move:",
    move
);





//--------------------------------
// Current location
//--------------------------------


console.log(
    "Current Location:",
    runtime.getCurrentLocation()
);





//--------------------------------
// Visited
//--------------------------------


console.log(
    "Visited:",
    runtime
        .getVisitedLocations()
        .includes(
            "MAP_VIRIDIAN_CITY"
        )
);