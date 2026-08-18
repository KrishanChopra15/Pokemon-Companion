"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



const session =
    app.get(
        "session"
    );



console.log(
    "Session:",
    Boolean(session)
);


console.log(
    "Game:",
    session.game
);


console.log(
    "Location:",
    session.getLocation()
);


console.log(
    "Container:",
    Boolean(app.getContainer())
);