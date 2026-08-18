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



runtime.start();



runtime.setPlayer({

    name:"Ash",

    starter:"CHARMANDER"

});



runtime.moveTo(
    "PALLET_TOWN"
);



const save =
    runtime.saveGame();



console.log(
    "Runtime Save:",
    save.success
);



const loaded =
    runtime.loadGame(
        save.saveId
    );



console.log(
    "Runtime Load:",
    loaded.success
);



console.log(
    "Location:",
    runtime.getCurrentLocation()
);