"use strict";


const GameSession =
    require("../scripts/session/game-session");


const SaveManager =
    require("../scripts/save/save-manager");



const session =
    new GameSession();



session.start();


session.setPlayer({

    name:"Ash",

    starter:"CHARMANDER"

});


session.setLocation(
    "PALLET_TOWN"
);



const manager =
    new SaveManager();



const save =
    manager.createSave(
        session
    );



console.log(
    "Save Created:",
    save.success
);


console.log(
    "Saved Player:",
    save.data.player.name
);


console.log(
    "Saved Starter:",
    save.data.player.starter
);



const newSession =
    new GameSession();



const loaded =
    manager.loadSave(

        save.saveId,

        newSession

    );



console.log(
    "Loaded:",
    loaded.success
);


console.log(
    "Loaded Location:",
    newSession.getLocation()
);