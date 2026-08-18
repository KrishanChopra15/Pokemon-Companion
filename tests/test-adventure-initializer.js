"use strict";


const PlayerManager =
    require("../scripts/player/player-manager");


const PlayerFlow =
    require("../scripts/player/player-flow");


const StarterSelectionService =
    require("../scripts/services/starter-selection-service");


const GameSession =
    require("../scripts/session/game-session");


const AdventureInitializer =
    require("../scripts/adventure/adventure-initializer");



const session =
    new GameSession();



const initializer =
    new AdventureInitializer(

        new PlayerFlow(

            new PlayerManager(),

            new StarterSelectionService(),

            session

        ),

        session

    );



const result =
    initializer.startAdventure(

        "Ash",

        "CHARMANDER"

    );



console.log(
    "Adventure:",
    result.success
);


console.log(
    "Player:",
    result.player.name
);


console.log(
    "Starter:",
    result.starter
);


console.log(
    "Location:",
    result.location
);