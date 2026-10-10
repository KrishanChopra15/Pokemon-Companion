/**
 * Pokémon Companion
 * Wild Battle Service Test
 *
 * Tests:
 * - Wild encounter creation
 * - Battle preparation
 * - Battle start
 * - Victory rewards
 * - EXP gain
 * - Level up
 * - Automatic evolution
 */

"use strict";



const WildBattleService =
    require("../scripts/services/wild-battle-service");


const BattleService =
    require("../scripts/services/battle-service");


const ExperienceService =
    require("../scripts/services/experience-service");


const GrowthRateService =
    require("../scripts/services/growth-rate-service");


const LevelUpService =
    require("../scripts/services/level-up-service");


const EvolutionService =
    require("../scripts/services/evolution-service");


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");


const PokemonProgressionService =
    require("../scripts/services/pokemon-progression-service");









//--------------------------------
// Services
//--------------------------------


const battleService =
    new BattleService();



const growthRates =
    new GrowthRateService();



const experienceService =
    new ExperienceService(

        growthRates

    );



const levelUpService =
    new LevelUpService();



const pokemonDatabase =
    new PokemonDatabaseService(

        "firered"

    );



const evolutionService =
    new EvolutionService(

        pokemonDatabase

    );





const progressionService =
    new PokemonProgressionService(

        experienceService,

        levelUpService,

        evolutionService

    );





const wildBattle =
    new WildBattleService(

        battleService,

        progressionService

    );









//--------------------------------
// Mock player
//--------------------------------


const player =
{

    party:
    [

        {

            species:
                "CHARMANDER",


            level:
                15,


            exp:
                3000,


            baseExp:
                62,


            growthRate:
                "GROWTH_MEDIUM_SLOW",


            hp:
                45,


            maxHP:
                45,


            moves:
            [

                "EMBER"

            ]

        }

    ]

};









//--------------------------------
// Wild Pokemon
//--------------------------------


const wildPokemon =
{

    species:
        "GEODUDE",


    level:
        12,


    baseExp:
        60,


    growthRate:
        "GROWTH_MEDIUM_FAST",


    hp:
        40

};









console.log();

console.log(
    "================================"
);

console.log(
    "Wild Battle Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Create encounter
//--------------------------------


console.log();

console.log(
    "Creating wild encounter:"
);


console.log(

    wildBattle.createEncounter(

        wildPokemon

    )

);









//--------------------------------
// Prepare battle
//--------------------------------


console.log();

console.log(
    "Preparing wild battle:"
);


console.log(

    wildBattle.prepareBattle(

        player,

        wildPokemon

    )

);









//--------------------------------
// Start battle
//--------------------------------


console.log();

console.log(
    "Starting wild battle:"
);


const battle =
    wildBattle.startBattle(

        player,

        wildPokemon

    );


console.log(

    battle

);









//--------------------------------
// Victory reward
//--------------------------------


console.log();

console.log(
    "Defeating Geodude:"
);


console.log(

    wildBattle.victory(

        player.party[0],

        wildPokemon

    )

);









//--------------------------------
// Pokemon after progression
//--------------------------------


console.log();

console.log(
    "Player Pokemon after reward:"
);


console.log(

    player.party[0]

);









//--------------------------------
// Automatic evolution check
//--------------------------------


console.log();

console.log(
    "Automatic Evolution check:"
);


console.log(

    wildBattle.checkEvolution(

        player.party[0]

    )

);









//--------------------------------
// Final
//--------------------------------


console.log();

console.log(
    "Final Pokemon:"
);


console.log(

    player.party[0]

);









console.log();

console.log(
    "Wild Battle Service Tests Completed."
);

console.log();