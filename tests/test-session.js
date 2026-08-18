"use strict";


const GameSession =
    require("../scripts/session/game-session");



const session =
    new GameSession();



console.log(
    "Game:",
    session.game
);


console.log(
    "Location:",
    session.getLocation()
);


console.log(
    "Start:",
    session.start().success
);


console.log(
    "State:",
    Boolean(session.getState())
);