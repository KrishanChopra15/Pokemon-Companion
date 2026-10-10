/**
 * Pokémon Companion
 * Pokémon Database Service Test
 *
 * Tests:
 * - Load Pokémon database
 * - Get Pokémon by name
 * - Get Pokémon by ID
 * - Get evolution data
 * - Missing Pokémon handling
 * - Missing evolution handling
 */

"use strict";



const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");









//--------------------------------
// Service
//--------------------------------


// Change FIRE_RED if your generated folder
// uses another game name


const database =
    new PokemonDatabaseService(

        "firered"

    );









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Database Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Get Pokemon
//--------------------------------


console.log();

console.log(
    "Getting Charmander:"
);


console.log(

    database.getPokemon(

        "CHARMANDER"

    )

);









//--------------------------------
// Get Pokemon ID
//--------------------------------


console.log();

console.log(
    "Getting Pokemon by ID:"
);


console.log(

    database.getPokemonById(

        4

    )

);









//--------------------------------
// Evolution lookup
//--------------------------------


console.log();

console.log(
    "Charmander evolution:"
);


console.log(

    database.getEvolution(

        "CHARMANDER"

    )

);









//--------------------------------
// Bulbasaur evolution
//--------------------------------


console.log();

console.log(
    "Bulbasaur evolution:"
);


console.log(

    database.getEvolution(

        "BULBASAUR"

    )

);









//--------------------------------
// No evolution
//--------------------------------


console.log();

console.log(
    "Pokemon without evolution:"
);


console.log(

    database.getEvolution(

        "MEWTWO"

    )

);









//--------------------------------
// Missing Pokemon
//--------------------------------


console.log();

console.log(
    "Missing Pokemon:"
);


console.log(

    database.getPokemon(

        "UNKNOWN"

    )

);









//--------------------------------
// Type search
//--------------------------------


console.log();

console.log(
    "Fire Pokemon count:"
);


console.log(

    database.getByType(

        "FIRE"

    ).length

);









//--------------------------------
// Ability search
//--------------------------------


console.log();

console.log(
    "Blaze Pokemon count:"
);


console.log(

    database.getByAbility(

        "BLAZE"

    ).length

);









console.log();

console.log(
    "Pokemon Database Tests Completed."
);

console.log();
