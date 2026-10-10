/**
 * Pokémon Companion
 * Pokémon Source Resolver Service Test
 *
 * Tests:
 * - Wild sources
 * - Evolution sources
 * - Starter sources
 * - Trade sources
 * - Multiple acquisition methods
 */

"use strict";



const PokemonSourceResolverService =
    require("../scripts/services/pokemon-source-resolver-service");


const EvolutionRequirementService =
    require("../scripts/services/evolution-requirement-service");


const StarterSelectionService =
    require("../scripts/services/starter-selection-service");









//--------------------------------
// Mock encounters
//--------------------------------


const encounters =
[

    {
        species:
            "PIKACHU",

        location:
            "VIRIDIAN_FOREST",

        level:
            3
    },


    {
        species:
            "DRATINI",

        location:
            "SAFARI_ZONE",

        level:
            15
    }

];









//--------------------------------
// Mock evolution database
//--------------------------------


const evolutionDatabase =
[

    {
        species:
            "CHARMANDER",


        evolutions:
        [

            {

                target:
                    "SPECIES_CHARMELEON",

                method:
                    "LEVEL",

                level:
                    16

            }

        ]

    },



    {
        species:
            "CHARMELEON",


        evolutions:
        [

            {

                target:
                    "SPECIES_CHARIZARD",

                method:
                    "LEVEL",

                level:
                    36

            }

        ]

    }

];









const evolutionService =
    new EvolutionRequirementService(

        evolutionDatabase

    );









//--------------------------------
// Starter service
//--------------------------------


const starterService =
    new StarterSelectionService();









//--------------------------------
// Resolver
//--------------------------------


const resolver =
    new PokemonSourceResolverService(

        encounters,

        evolutionService,

        starterService

    );









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Source Resolver Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Pikachu
//--------------------------------


console.log();

console.log(
    "Pikachu sources:"
);


console.log(

    resolver.resolve(

        "PIKACHU"

    )

);









//--------------------------------
// Dratini
//--------------------------------


console.log();

console.log(
    "Dratini sources:"
);


console.log(

    resolver.resolve(

        "DRATINI"

    )

);









//--------------------------------
// Charmander
//--------------------------------


console.log();

console.log(
    "Charmander sources:"
);


console.log(

    resolver.resolve(

        "CHARMANDER"

    )

);









//--------------------------------
// Charizard
//--------------------------------


console.log();

console.log(
    "Charizard sources:"
);


console.log(

    resolver.resolve(

        "CHARIZARD"

    )

);









//--------------------------------
// Explain
//--------------------------------


console.log();

console.log(
    "Explanation:"
);


console.log(

    resolver.explain(

        "CHARIZARD"

    )

);









console.log();

console.log(
    "Pokemon Source Resolver Service Tests Completed."
);

console.log();