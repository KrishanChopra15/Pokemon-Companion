"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



console.log(
    "Pokemon Explanation:",
    Boolean(
        app.get(
            "pokemonExplanation"
        )
    )
);



console.log(
    "Pokemon Source Resolver:",
    Boolean(
        app.get(
            "pokemonSourceResolver"
        )
    )
);



console.log(
    "Pokemon Tracker:",
    Boolean(
        app.get(
            "pokemonTracker"
        )
    )
);