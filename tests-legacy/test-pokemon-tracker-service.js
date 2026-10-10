/**
 * Pokémon Companion
 * Pokémon Tracker Service Test
 *
 * Tests:
 * - Add Pokémon
 * - Get tracked Pokémon
 * - Find Pokémon
 * - Update Pokémon
 * - Favorite Pokémon
 * - Remove Pokémon
 * - Collection summary
 */

"use strict";



const PokemonTrackerService =
    require("../scripts/services/pokemon-tracker-service");









//--------------------------------
// Service
//--------------------------------


const tracker =
    new PokemonTrackerService();









//--------------------------------
// Mock Pokemon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",


    level:
        16,


    exp:
        4096,


    moves:
    [

        "EMBER",

        "SCRATCH"

    ]

};









const pikachu =
{

    species:
        "PIKACHU",


    level:
        20,


    exp:
        8000,


    moves:
    [

        "THUNDERBOLT"

    ]

};









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Tracker Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Add Pokemon
//--------------------------------


console.log();

console.log(
    "Adding Charmander:"
);


const charmanderResult =
    tracker.addPokemon(

        charmander

    );


console.log(

    charmanderResult

);









console.log();

console.log(
    "Adding Pikachu:"
);


const pikachuResult =
    tracker.addPokemon(

        pikachu

    );


console.log(

    pikachuResult

);









//--------------------------------
// Get all
//--------------------------------


console.log();

console.log(
    "All tracked Pokemon:"
);


console.log(

    tracker.getAll()

);









//--------------------------------
// Find Pokemon
//--------------------------------


console.log();

console.log(
    "Finding Charmander:"
);


console.log(

    tracker.findPokemon(

        "CHARMANDER"

    )

);









//--------------------------------
// Update Pokemon
//--------------------------------


console.log();

console.log(
    "Updating Charmander:"
);


console.log(

    tracker.updatePokemon(

        1,

        {

            level:
                17,


            exp:
                5000

        }

    )

);









console.log();

console.log(
    "Charmander after update:"
);


console.log(

    tracker.getPokemon(

        1

    )

);









//--------------------------------
// Favorite
//--------------------------------


console.log();

console.log(
    "Favoriting Pikachu:"
);


console.log(

    tracker.favoritePokemon(

        2

    )

);









console.log();

console.log(
    "Pikachu after favorite:"
);


console.log(

    tracker.getPokemon(

        2

    )

);









//--------------------------------
// Summary
//--------------------------------


console.log();

console.log(
    "Collection summary:"
);


console.log(

    tracker.getSummary()

);









//--------------------------------
// Remove Pokemon
//--------------------------------


console.log();

console.log(
    "Removing Charmander:"
);


console.log(

    tracker.removePokemon(

        1

    )

);









console.log();

console.log(
    "Final collection:"
);


console.log(

    tracker.getAll()

);









console.log();

console.log(
    "Final summary:"
);


console.log(

    tracker.getSummary()

);









console.log();

console.log(
    "Pokemon Tracker Service Tests Completed."
);

console.log();