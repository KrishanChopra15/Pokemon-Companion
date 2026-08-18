"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



console.log(

    "Starter Selection:",

    Boolean(

        app.get(
            "starterSelection"
        )

    )

);