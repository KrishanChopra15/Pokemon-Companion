/**
 * Pokémon Companion
 * Team Recommendation Service Test
 *
 * Tests:
 * - Type advantage checking
 * - Team ranking
 * - Availability filtering
 * - Gym matchup recommendation
 * - Recommendation summary
 */

"use strict";



const TeamRecommendationService =
    require("../scripts/services/team-recommendation-service");


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");


const PokemonAvailabilityService =
    require("../scripts/services/pokemon-availability-service");









//--------------------------------
// Services
//--------------------------------


const pokemonDatabase =
    new PokemonDatabaseService(

        "firered"

    );





const availabilityService =
    new PokemonAvailabilityService(

        pokemonDatabase

    );





const recommendationService =
    new TeamRecommendationService(

        availabilityService

    );









//--------------------------------
// User Pokemon
//--------------------------------


const userPokemon =
[

    {

        species:
            "CHARIZARD",

        level:
            36,

        type:
            "FIRE",

        moves:
        [

            "FLAMETHROWER"

        ]

    },


    {

        species:
            "PIKACHU",

        level:
            32,

        type:
            "ELECTRIC",

        moves:
        [

            "THUNDERBOLT"

        ]

    },


    {

        species:
            "LAPRAS",

        level:
            34,

        type:
            "WATER",

        moves:
        [

            "SURF",

            "ICE_BEAM"

        ]

    },


    {

        species:
            "PIDGEOTTO",

        level:
            25,

        type:
            "FLYING",

        moves:
        [

            "GUST"

        ]

    }

];









//--------------------------------
// Opponent teams
//--------------------------------


const mistyTeam =
[

    {

        species:
            "STARYU",

        level:
            18,

        type:
            "WATER"

    },


    {

        species:
            "STARMIE",

        level:
            21,

        type:
            "WATER"

    }

];









const grassTeam =
[

    {

        species:
            "ODDISH",

        level:
            20,

        type:
            "GRASS"

    },


    {

        species:
            "IVYSAUR",

        level:
            22,

        type:
            "GRASS"

    }

];









const brockCounters =
[

    {

        species:
            "SQUIRTLE",

        level:
            15,

        type:
            "WATER"

    },


    {

        species:
            "BULBASAUR",

        level:
            14,

        type:
            "GRASS"

    },


    {

        species:
            "PIKACHU",

        level:
            12,

        type:
            "ELECTRIC"

    },


    {

        species:
            "NIDOKING",

        level:
            16,

        type:
            "GROUND"

    },


    {

        species:
            "NIDOQUEEN",

        level:
            16,

        type:
            "GROUND"

    }

];









console.log();

console.log(
    "================================"
);

console.log(
    "Team Recommendation Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Type checks
//--------------------------------


console.log();

console.log(
    "Pikachu vs Starmie:"
);


console.log(

    recommendationService.checkTypeAdvantage(

        "ELECTRIC",

        "WATER"

    )

);









console.log();

console.log(
    "Charizard vs Ivysaur:"
);


console.log(

    recommendationService.checkTypeAdvantage(

        "FIRE",

        "GRASS"

    )

);









console.log();

console.log(
    "Water vs Electric:"
);


console.log(

    recommendationService.checkTypeAdvantage(

        "WATER",

        "ELECTRIC"

    )

);









//--------------------------------
// Misty recommendation
//--------------------------------


console.log();

console.log(
    "Recommended team vs Misty:"
);


const mistyResult =
    recommendationService.recommendTeam(

        userPokemon,

        mistyTeam

    );


console.log(

    mistyResult

);









console.log();

console.log(
    "Misty recommendation summary:"
);


console.log(

    recommendationService.createSummary(

        mistyResult

    )

);









//--------------------------------
// Grass trainer
//--------------------------------


console.log();

console.log(
    "Recommended team vs Grass trainer:"
);


const grassResult =
    recommendationService.recommendTeam(

        userPokemon,

        grassTeam

    );


console.log(

    grassResult

);









console.log();

console.log(
    "Grass trainer summary:"
);


console.log(

    recommendationService.createSummary(

        grassResult

    )

);









//--------------------------------
// Brock availability test
//--------------------------------


console.log();

console.log(
    "Brock counters before first badge:"
);


const brockResult =
    recommendationService.recommendTeam(

        brockCounters,

        [

            {

                species:
                    "GEODUDE",

                level:
                    12,

                type:
                    "ROCK"

            },

            {

                species:
                    "ONIX",

                level:
                    14,

                type:
                    "ROCK"

            }

        ],

        6,

        {

            progression:
                "BEFORE_BROCK"

        }

    );





console.log(

    brockResult

);









console.log();

console.log(
    "Brock recommendation summary:"
);


console.log(

    recommendationService.createSummary(

        brockResult

    )

);









console.log();

console.log(
    "Team Recommendation Service Tests Completed."
);

console.log();