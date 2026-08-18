"use strict";


const PlayerManager =
    require("../scripts/player/player-manager");


const GameSession =
    require("../scripts/session/game-session");



const manager =
    new PlayerManager();


const session =
    new GameSession();



const result =
    manager.createPlayer(
        "Ash"
    );



console.log(
    "Player Created:",
    result.success
);


console.log(
    "Name:",
    result.player.name
);


console.log(
    "Attach:",
    manager.attachToSession(
        session,
        result.player
    ).success
);


console.log(
    "Session Player:",
    session.getPlayer().name
);