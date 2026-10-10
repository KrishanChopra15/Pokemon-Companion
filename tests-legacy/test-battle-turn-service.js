/**
 * Pokémon Companion
 * Battle Turn Service Test
 *
 * Tests:
 * - Move execution
 * - PP handling
 * - Battle logs
 * - Struggle recoil
 * - End turn effects
 */

"use strict";





const BattleTurnService =
    require("../scripts/services/battle-turn-service");


const MoveExecutionService =
    require("../scripts/services/move-execution-service");


const MoveMechanicsService =
    require("../scripts/services/move-mechanics-service");


const MoveEffectService =
    require("../scripts/services/move-effect-service");


const DamageCalculationService =
    require("../scripts/services/damage-calculation-service");


const TypeEffectivenessService =
    require("../scripts/services/type-effectiveness-service");


const MoveDatabaseService =
    require("../scripts/services/move-database-service");


const StatStageService =
    require("../scripts/services/stat-stage-service");


const StatusEffectService =
    require("../scripts/services/status-effect-service");






console.log();

console.log(
"================================"
);

console.log(
"Battle Turn Service Tests"
);

console.log(
"================================"
);









const statStage =
    new StatStageService();


const statusEffectService =
    new StatusEffectService();


const moveDatabase =
    new MoveDatabaseService();


const moveMechanics =
    new MoveMechanicsService(
        "firered",
        moveDatabase
    );


const moveEffect =
    new MoveEffectService(
        statStage,
        statusEffectService
    );


const typeEffectiveness =
    new TypeEffectivenessService();


const damageCalculation =
    new DamageCalculationService(
        typeEffectiveness,
        statusEffectService
    );


const moveExecutionService =
    new MoveExecutionService(

        moveMechanics,

        moveEffect,

        damageCalculation,

        statusEffectService

    );









//--------------------------------
// Mock weather
//--------------------------------


const weatherService =
{

    processTurn(
        pokemon
    )
    {


        if(
            pokemon.weatherDamage
        )
        {

            pokemon.hp -= 3;


            return {

                damage:
                    3

            };

        }


        return null;

    }

};









const battleTurn =
    new BattleTurnService(

        moveExecutionService,

        statusEffectService,

        weatherService

    );









//--------------------------------
// Helpers
//--------------------------------


const playerPokemon =
{

    species:
        "CHARMANDER",

    level:
        12,

    hp:
        50,

    maxHP:
        50,

    attack:
        20,

    defense:
        18,

    spAttack:
        24,

    spDefense:
        20,

    speed:
        60,


    types:
    [
        "FIRE"
    ],


    moves:
    [
        {

            name:
                "EMBER",

            constant:
                "MOVE_EMBER",

            type:
                "FIRE",

            category:
                "SPECIAL",

            power:
                40,

            accuracy:
                100,

            pp:
                10

        }
    ]

};





const enemyPokemon =
{

    species:
        "GEODUDE",

    level:
        12,

    hp:
        40,

    maxHP:
        40,


    attack:
        25,

    defense:
        30,

    spAttack:
        15,

    spDefense:
        20,


    speed:
        20,


    types:
    [
        "ROCK",
        "GROUND"
    ]

};









const battle =
{

    weather:
        null

};









const getActivePokemon =
    side =>

        side.party[

            side.active

        ];









const playerSide =
{

    active:
        0,


    party:
    [

        playerPokemon

    ]

};









const enemySide =
{

    active:
        0,


    party:
    [

        enemyPokemon

    ]

};









//--------------------------------
// Normal move test
//--------------------------------


console.log();

console.log(
"Normal move execution:"
);



const result =
{

    actions:
        []

};









battleTurn.executeTurnMove(

    playerSide,

    enemySide,

    {

        name:
            "EMBER",

        constant:
            "MOVE_EMBER",

        power:
        40,

        type:
        "FIRE",

        category:
        "SPECIAL",

        accuracy:
        100

    },

    result,

    battle,

    getActivePokemon

);









console.log(

    JSON.stringify(

        result,

        null,

        4

    )

);



console.log({

    enemyHP:
        enemyPokemon.hp

});









//--------------------------------
// PP consumption
//--------------------------------


console.log();

console.log(
"PP consumption:"
);



console.log({

    before:
        playerPokemon.moves[0].pp

});









battleTurn.consumePP(

    playerPokemon,

    {

        name:
            "EMBER",

        constant:
            "MOVE_EMBER"

    }

);









console.log({

    after:
        playerPokemon.moves[0].pp

});









//--------------------------------
// Struggle test
//--------------------------------


console.log();

console.log(
"Struggle recoil test:"
);



const strugglePokemon =
{

    species:
        "PIKACHU",


    level:
        10,


    hp:
        40,


    maxHP:
        40,


    attack:
        15,


    defense:
        15,


    spAttack:
        15,


    spDefense:
        15,


    speed:
        20,


    types:
    [
        "ELECTRIC"
    ],


    moves:
    [

        {
            name:
                "THUNDER_SHOCK",

            constant:
                "MOVE_THUNDER_SHOCK",

            type:
                "ELECTRIC",

            category:
                "SPECIAL",

            power:
                40,

            accuracy:
                100,

            pp:
                10
        }

    ]

};





const struggleTarget =
{

    species:
        "GEODUDE",


    level:
        10,


    hp:
        50,


    maxHP:
        50,


    attack:
        20,


    defense:
        25,


    spAttack:
        10,


    spDefense:
        15,


    speed:
        10,


    types:
    [
        "ROCK",
        "GROUND"
    ]

};





const strugglePlayer =
{

    active:
        0,


    party:
    [

        strugglePokemon

    ]

};





const struggleEnemy =
{

    active:
        0,


    party:
    [

        struggleTarget

    ]

};









const struggleResult =
{

    actions:
        []

};









battleTurn.executeTurnMove(

    strugglePlayer,

    struggleEnemy,

    {

        name:
            "STRUGGLE",

        constant:
            "MOVE_STRUGGLE"

    },

    struggleResult,

    battle,

    getActivePokemon

);









console.log(

    JSON.stringify(

        struggleResult,

        null,

        4

    )

);



console.log({

    recoilHP:
        strugglePokemon.hp

});









//--------------------------------
// End turn status test
//--------------------------------


console.log();

console.log(
"Status damage:"
);



const statusPokemon =
{

    species:
        "CHARMANDER",


    hp:
        30,


    status:
        "BURN"

};





const statusBattle =
{

    player:
    {

        active:
            0,


        party:
        [

            statusPokemon

        ]

    },


    opponent:
    {

        active:
            0,


        party:
        [

            {

                species:
                    "GEODUDE",

                hp:
                    40

            }

        ]

    }

};





const statusResult =
{

    actions:
        []

};









battleTurn.processEndTurn(

    statusBattle,

    statusResult,

    getActivePokemon

);









console.log(

    JSON.stringify(

        statusResult,

        null,

        4

    )

);



console.log({

    remainingHP:
        statusPokemon.hp

});









//--------------------------------
// Weather test
//--------------------------------


console.log();

console.log(
"Weather damage:"
);



const weatherPokemon =
{

    species:
        "PIKACHU",


    hp:
        30,


    weatherDamage:
        true

};









const weatherBattle =
{

    player:
    {

        active:
            0,


        party:
        [

            weatherPokemon

        ]

    },


    opponent:
    {

        active:
            0,


        party:
        [

            {

                species:
                    "GEODUDE",

                hp:
                    40

            }

        ]

    }

};









const weatherResult =
{

    actions:
        []

};









battleTurn.processEndTurn(

    weatherBattle,

    weatherResult,

    getActivePokemon

);









console.log(

    JSON.stringify(

        weatherResult,

        null,

        4

    )

);



console.log({

    remainingHP:
        weatherPokemon.hp

});









console.log();

console.log(
"================================"
);

console.log(
"Battle Turn Service Tests Completed."
);

console.log(
"================================"
);