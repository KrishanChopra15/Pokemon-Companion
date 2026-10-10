"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Storage Manager:",
    !!app.get(
        "storageManager"
    )
);



console.log(
    "Storage Flow:",
    !!app.get(
        "storageFlow"
    )
);