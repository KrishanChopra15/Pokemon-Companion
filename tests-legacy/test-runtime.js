"use strict";


const AppContainer =
    require("../scripts/app-container");


const GameRuntime =
    require("../scripts/runtime/game-runtime");



const app =
    new AppContainer();



const runtime =
    new GameRuntime(
        app
    );



console.log(
    "Runtime:",
    Boolean(runtime)
);


console.log(
    "Start:",
    runtime.start().success
);


console.log(
    "Game:",
    runtime.getInfo().game
);


console.log(
    "Location:",
    runtime.getCurrentLocation()
);


console.log(
    "Battle Service:",
    Boolean(
        runtime.getService(
            "battle"
        )
    )
);