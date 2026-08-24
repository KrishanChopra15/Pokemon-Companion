/**
 * Pokémon Companion
 * Battle Reward Service Test
 *
 * Tests:
 * - Battle EXP calculation
 * - Giving EXP
 * - Level up
 * - Evolution trigger
 * - Trainer rewards
 */

"use strict";





const BattleRewardService =
    require("../scripts/services/battle-reward-service");


const ExperienceService =
    require("../scripts/services/experience-service");


const GrowthRateService =
    require("../scripts/services/growth-rate-service");


const EvolutionService =
    require("../scripts/services/evolution-service");


const PokemonDatabaseService =
    require("../scripts/services/pokemon-database-service");


const RewardService =
    require("../scripts/services/reward-service");


const TrainerState =
    require("../scripts/domain/trainer-state");









console.log();

console.log(
"================================"
);

console.log(
"Battle Reward Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Services
//--------------------------------


const growthRateService =

    new GrowthRateService();



const experienceService =

    new ExperienceService(

        growthRateService

    );





const pokemonDatabase =

    new PokemonDatabaseService(

        "firered"

    );





const evolutionService =

    new EvolutionService(

        pokemonDatabase

    );





const rewardService =

    new RewardService();









const battleRewardService =

    new BattleRewardService(

        experienceService,

        evolutionService,

        rewardService

    );









//--------------------------------
// Pokemon factory
//--------------------------------


function createCharmander()
{

    return {


        species:
            "CHARMANDER",


        level:
            15,


        exp:
            2200,


        growthRate:
            "GROWTH_MEDIUM_SLOW",


        baseExp:
            62


    };

}









const geodude =
{

    species:
        "GEODUDE",


    level:
        12,


    baseExp:
        60

};









//--------------------------------
// Trainer
//--------------------------------


const trainerState =

    new TrainerState();









//--------------------------------
// EXP reward test
//--------------------------------


console.log();

console.log(
"Battle EXP:"
);



const expPokemon =
    createCharmander();





const expResult =

    battleRewardService.giveBattleExp(

        expPokemon,

        geodude,

        "TRAINER"

    );





console.log(

    JSON.stringify(

        expResult,

        null,

        4

    )

);









console.log();

console.log(
"Charmander after EXP:"
);



console.log(

    expPokemon

);









//--------------------------------
// Evolution test
//--------------------------------


console.log();

console.log(
"Evolution check:"
);



const evolutionPokemon =
    createCharmander();



evolutionPokemon.level =
    16;



evolutionPokemon.exp =
    2560;





const evolutionResult =

    battleRewardService.checkEvolution(

        evolutionPokemon

    );





console.log(

    JSON.stringify(

        evolutionResult,

        null,

        4

    )

);









console.log();

console.log(
"Pokemon after evolution:"
);



console.log(

    evolutionPokemon

);









//--------------------------------
// Full rewards test
//--------------------------------


console.log();

console.log(
"Full battle rewards:"
);



const rewardPokemon =
    createCharmander();



const fullResult =

    battleRewardService.processBattleRewards(

        rewardPokemon,

        geodude,

        {


            addItems:
            [

                {

                    name:
                        "POTION",


                    quantity:
                        1

                }

            ],


            addMoney:
                1000,


            addStoryFlags:
            [

                "BROCK_DEFEATED"

            ]


        },

        trainerState,

        "TRAINER"

    );





console.log(

    JSON.stringify(

        fullResult,

        null,

        4

    )

);









console.log();

console.log(
"Trainer state:"
);



console.log(

    JSON.stringify(

        trainerState.getState(),

        null,

        4

    )

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Reward Service Tests Completed."
);

console.log(
"================================"
);

console.log();