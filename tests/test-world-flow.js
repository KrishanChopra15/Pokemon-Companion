"use strict";


const GameSession =
    require("../scripts/session/game-session");


const WorldManager =
    require("../scripts/world/world-manager");


const WorldFlow =
    require("../scripts/world/world-flow");



const session =
    new GameSession();



session.start();



const world =
    new WorldManager(
        session
    );



const flow =
    new WorldFlow(
        world
    );



console.log(
    "World:",
    Boolean(flow)
);



console.log(
    "Current Location:",
    world.getCurrentLocation()
);



const move =
    flow.moveTo(
        "VIRIDIAN_CITY"
    );



console.log(
    "Move:",
    move.success
);



console.log(
    "New Location:",
    world.getCurrentLocation()
);



console.log(
    "Visited:",
    world.hasVisited(
        "VIRIDIAN_CITY"
    )
);