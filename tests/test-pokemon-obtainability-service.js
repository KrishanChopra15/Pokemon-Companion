/**
 * Pokémon Companion
 * Pokémon Obtainability Service Test
 *
 * Tests:
 * - Wild obtainability
 * - Location restrictions
 * - Starter availability
 * - Starter restrictions
 * - Evolution sources
 * - Trade availability
 */

"use strict";



const PokemonSourceResolverService =
    require("../scripts/services/pokemon-source-resolver-service");


const PokemonObtainabilityService =
    require("../scripts/services/pokemon-obtainability-service");


const LocationAvailabilityService =
    require("../scripts/services/location-availability-service");


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
// Location rules
//--------------------------------


const locationRules =
[

    {
        location:
            "VIRIDIAN_FOREST",

        requirement:
        {

            badges:[]

        }

    },


    {
        location:
            "SAFARI_ZONE",

        requirement:
        {

            flags:
            [
                "REACHED_FUCHSIA_CITY"
            ]

        }

    }

];









const locationService =
    new LocationAvailabilityService(

        [],

        locationRules

    );









//--------------------------------
// Evolution database
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
// Starter Service
//--------------------------------


const starterService =
    new StarterSelectionService();



const playerState =
{

    starter:
        "CHARMANDER"

};









//--------------------------------
// Source Resolver
//--------------------------------


const sourceResolver =
    new PokemonSourceResolverService(

        encounters,

        evolutionService,

        starterService

    );









//--------------------------------
// Obtainability Service
//--------------------------------


const obtainability =
    new PokemonObtainabilityService(

        sourceResolver,

        locationService,

        null,

        starterService

    );









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Obtainability Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Pikachu
//--------------------------------


console.log();

console.log(
    "Pikachu before Brock:"
);


console.log(

    obtainability.canObtain(

        "PIKACHU",

        {

            badges:[]

        }

    )

);









//--------------------------------
// Dratini blocked
//--------------------------------


console.log();

console.log(
    "Dratini before Fuchsia:"
);


console.log(

    obtainability.canObtain(

        "DRATINI",

        {

            badges:[],

            flags:[]

        }

    )

);









//--------------------------------
// Dratini available
//--------------------------------


console.log();

console.log(
    "Dratini after Fuchsia:"
);


console.log(

    obtainability.canObtain(

        "DRATINI",

        {

            badges:[],

            flags:
            [
                "REACHED_FUCHSIA_CITY"
            ]

        }

    )

);









//--------------------------------
// Charmander starter
//--------------------------------


console.log();

console.log(
    "Charmander:"
);


console.log(

    obtainability.canObtain(

        "CHARMANDER",

        {

            playerState

        }

    )

);









//--------------------------------
// Squirtle wrong starter
//--------------------------------


console.log();

console.log(
    "Squirtle without trade:"
);


console.log(

    obtainability.canObtain(

        "SQUIRTLE",

        {

            playerState

        }

    )

);









//--------------------------------
// Charizard evolution
//--------------------------------


console.log();

console.log(
    "Charizard:"
);


console.log(

    obtainability.canObtain(

        "CHARIZARD",

        {

            playerState

        }

    )

);









//--------------------------------
// Trade
//--------------------------------


console.log();

console.log(
    "Traded Squirtle:"
);


console.log(

    obtainability.canObtain(

        "SQUIRTLE",

        {

            allowTrade:true,

            playerState

        }

    )

);









console.log();

console.log(
    "Pokemon Obtainability Service Tests Completed."
);

console.log();