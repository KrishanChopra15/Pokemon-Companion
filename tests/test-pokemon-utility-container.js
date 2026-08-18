/**
 * Pokémon Companion
 * Pokémon Utility Container Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



console.log(

    "Evolution Requirement:",

    Boolean(
        app.get(
            "evolutionRequirement"
        )
    )

);



console.log(

    "Growth Rate:",

    Boolean(
        app.get(
            "growthRate"
        )
    )

);



console.log(

    "Pokemon Progression:",

    Boolean(
        app.get(
            "pokemonProgression"
        )
    )

);