/**
 * Pokémon Companion
 * Pokémon Availability Service Test
 *
 * Tests:
 * - Normal availability
 * - Evolution difficulty warnings
 * - Official restrictions
 * - Trade availability
 * - Missing Pokemon
 * - Filtering
 * - Explanation output
 */

"use strict";


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");


const PokemonAvailabilityService =
    require("../scripts/services/pokemon-availability-service");


const EvolutionRequirementService =
    require("../scripts/services/evolution-requirement-service");


const FireRedRules =
    require("../scripts/rules/firered-availability-rules");


const PokemonRestrictions =
    require("../scripts/rules/firered-pokemon-restrictions");









//--------------------------------
// Pokemon Database
//--------------------------------


const pokemonDatabase =
    new PokemonDatabaseService(

        "firered"

    );









//--------------------------------
// Mock evolution database
//--------------------------------


const evolutionDatabase =
[

    {
        species:"CHARMANDER",

        evolutions:
        [

            {
                target:"SPECIES_CHARMELEON",

                method:"LEVEL",

                level:16
            }

        ]

    },


    {
        species:"CHARMELEON",

        evolutions:
        [

            {
                target:"SPECIES_CHARIZARD",

                method:"LEVEL",

                level:36
            }

        ]

    }

];









const evolutionService =
    new EvolutionRequirementService(

        evolutionDatabase

    );









//--------------------------------
// Service
//--------------------------------


const availability =
    new PokemonAvailabilityService(

        pokemonDatabase,

        null,

        evolutionService,

        null,

        FireRedRules,

        PokemonRestrictions

    );









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Availability Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Charmander
//--------------------------------


console.log();

console.log(
    "Charmander before Brock:"
);


console.log(

    availability.isAvailable(

        "CHARMANDER",

        {

            progression:"BROCK"

        }

    )

);









//--------------------------------
// Charmeleon
//--------------------------------


console.log();

console.log(
    "Charmeleon before Brock:"
);


console.log(

    availability.isAvailable(

        "CHARMELEON",

        {

            progression:"BROCK"

        }

    )

);









//--------------------------------
// Charizard
//--------------------------------


console.log();

console.log(
    "Charizard before Brock:"
);


console.log(

    availability.isAvailable(

        "CHARIZARD",

        {

            progression:"BROCK"

        }

    )

);









//--------------------------------
// Mewtwo
//--------------------------------


console.log();

console.log(
    "Mewtwo before Brock:"
);


console.log(

    availability.isAvailable(

        "MEWTWO",

        {

            progression:"BROCK",

            nationalDex:false

        }

    )

);









//--------------------------------
// Mewtwo post game
//--------------------------------


console.log();

console.log(
    "Mewtwo post game:"
);


console.log(

    availability.isAvailable(

        "MEWTWO",

        {

            progression:"POST_GAME",

            nationalDex:true

        }

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

    availability.isAvailable(

        "MISSINGMON"

    )

);









//--------------------------------
// Trade Pokemon
//--------------------------------


console.log();

console.log(
    "Traded Squirtle:"
);


console.log(

    availability.checkTrade(

        "SQUIRTLE",

        {

            source:"TRADE"

        }

    )

);









//--------------------------------
// Filter
//--------------------------------


console.log();

console.log(
    "Filtering Brock recommendations:"
);



const recommendations =
[

    "CHARMANDER",

    "CHARIZARD",

    "MEWTWO",

    "PIKACHU"

];





console.log(

    availability.filterAvailable(

        recommendations,

        {

            progression:"BROCK",

            nationalDex:false

        }

    )

);









//--------------------------------
// Explain
//--------------------------------


console.log();

console.log(
    "Availability explanation:"
);


console.log(

    availability.explain(

        "CHARIZARD",

        {

            progression:"BROCK"

        }

    )

);









console.log();

console.log(
    "Pokemon Availability Service Tests Completed."
);

console.log();