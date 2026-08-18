/**
 * Pokémon Companion
 * Application Bootstrap Test
 */

"use strict";


const Application =
    require("../scripts/app");



const app =
    new Application();



console.log(
    "Application:",
    app.getInfo().name
);



console.log(
    "Game:",
    app.getInfo().game
);



console.log(
    "Container:",
    Boolean(
        app.getContainer()
    )
);



console.log(
    "Pokemon Database:",
    Boolean(
        app.get(
            "pokemonDatabase"
        )
    )
);



console.log(
    "Battle Service:",
    Boolean(
        app.get(
            "battle"
        )
    )
);