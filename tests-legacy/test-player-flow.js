"use strict";


const PlayerManager =
    require("../scripts/player/player-manager");


const StarterSelectionService =
    require("../scripts/services/starter-selection-service");


const GameSession =
    require("../scripts/session/game-session");


const PlayerFlow =
    require("../scripts/player/player-flow");



const flow =
    new PlayerFlow(

        new PlayerManager(),

        new StarterSelectionService(),

        new GameSession()

    );



console.log(
    "Create:",
    flow.createPlayer(
        "Ash"
    ).success
);



console.log(
    "Starter:",
    flow.chooseStarter(
        "CHARMANDER"
    ).success
);



console.log(
    "Player:",
    flow.getPlayer().name
);



console.log(
    "Selected Starter:",
    flow.getStarter()
);