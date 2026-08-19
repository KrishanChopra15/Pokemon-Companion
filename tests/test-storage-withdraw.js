/**
 * Pokémon Companion
 * Storage Withdraw Test
 *
 * Tests:
 * - Storage → Team movement
 * - Removing from PC
 * - Adding to party
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



const storage =
    app.get(
        "storageFlow"
    );


const team =
    app.get(
        "teamFlow"
    );





//--------------------------------
// Add Pokémon to Storage
//--------------------------------


const stored =
    storage
        .storePokemon({

            species:
                "MEOWTH",

            level:
                7,

            location:
                "ROUTE_5"

        });



console.log(
    "Store:",
    stored.success
);





console.log(
    "Storage Before:",
    storage
        .getStatus()
        .count
);





//--------------------------------
// Withdraw
//--------------------------------


const pokemon =
    storage
        .getStorage()[0];



const withdrawn =
    storage
        .withdrawPokemon(
            pokemon.id
        );





console.log(
    "Withdraw:",
    withdrawn.success
);





console.log(
    "Pokemon:",
    withdrawn.pokemon.species
);





console.log(
    "Team Size:",
    team
        .getTeam()
        .length
);





console.log(
    "Storage After:",
    storage
        .getStatus()
        .count
);