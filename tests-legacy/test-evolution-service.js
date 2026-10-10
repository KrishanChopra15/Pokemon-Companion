/**
 * Pokémon Companion
 * Evolution Service Test
 *
 * Tests:
 * - Automatic evolution lookup
 * - Level evolution
 * - Evolution requirements
 * - Item evolution
 * - Trade evolution
 * - Failed evolution checks
 */

"use strict";



const EvolutionService =
    require("../scripts/services/evolution-service");


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");









//--------------------------------
// Services
//--------------------------------


const pokemonDatabase =
    new PokemonDatabaseService(

        "firered"

    );



const evolutionService =
    new EvolutionService(

        pokemonDatabase

    );









//--------------------------------
// Mock Pokemon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",


    level:
        16

};









const bulbasaur =
{

    species:
        "BULBASAUR",


    level:
        15

};









const pikachu =
{

    species:
        "PIKACHU",


    level:
        20

};









const kadabra =
{

    species:
        "KADABRA",


    level:
        30

};









console.log();

console.log(
    "================================"
);

console.log(
    "Evolution Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Automatic lookup
//--------------------------------


console.log();

console.log(
    "Charmander automatic evolution lookup:"
);


console.log(

    evolutionService.getEvolutionData(

        charmander

    )

);









//--------------------------------
// Automatic evolution success
//--------------------------------


console.log();

console.log(
    "Charmander automatic evolution:"
);


console.log(

    evolutionService.checkEvolution(

        charmander

    )

);









console.log();

console.log(
    "Charmander after evolution:"
);


console.log(

    charmander

);









//--------------------------------
// Level evolution failure
//--------------------------------


console.log();

console.log(
    "Bulbasaur early evolution:"
);


console.log(

    evolutionService.checkEvolution(

        bulbasaur

    )

);









//--------------------------------
// Manual level evolution
//--------------------------------


console.log();

console.log(
    "Manual level evolution:"
);


console.log(

    evolutionService.evolveByLevel(

        {

            species:
                "CHARMANDER",

            level:
                16

        },

        "CHARMELEON",

        16

    )

);









//--------------------------------
// Item evolution
//--------------------------------


console.log();

console.log(
    "Item evolution:"
);


console.log(

    evolutionService.evolveByItem(

        pikachu,

        "RAICHU",

        "THUNDER_STONE",

        [

            "THUNDER_STONE"

        ]

    )

);









console.log();

console.log(
    "Pikachu after item evolution:"
);


console.log(

    pikachu

);









//--------------------------------
// Missing item
//--------------------------------


console.log();

console.log(
    "Missing evolution item:"
);


console.log(

    evolutionService.evolveByItem(

        {

            species:
                "PIKACHU",

            level:
                20

        },

        "RAICHU",

        "MOON_STONE",

        [

            "THUNDER_STONE"

        ]

    )

);









//--------------------------------
// Trade evolution
//--------------------------------


console.log();

console.log(
    "Trade evolution:"
);


console.log(

    evolutionService.evolveByTrade(

        kadabra,

        "ALAKAZAM",

        true

    )

);









console.log();

console.log(
    "Kadabra after trade:"
);


console.log(

    kadabra

);









//--------------------------------
// Failed trade
//--------------------------------


console.log();

console.log(
    "Trade not completed:"
);


console.log(

    evolutionService.evolveByTrade(

        {

            species:
                "KADABRA",

            level:
                30

        },

        "ALAKAZAM",

        false

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

    evolutionService.checkEvolution(

        pikachu

    )

);









console.log();

console.log(
    "Evolution Service Tests Completed."
);

console.log();