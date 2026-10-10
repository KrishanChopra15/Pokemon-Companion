/**
 * Pokémon Companion
 * Move Execution Service Test
 *
 * Tests:
 * - Move execution
 * - Damage calculation
 * - Accuracy
 * - HP reduction
 * - Move mechanics integration
 * - Move effects integration
 * - Damage calculation integration
 * - Move database integration
 * - Type effectiveness integration
 * - Stat stage damage integration
 * - Status damage integration
 * - Burn modifier integration
 * - Critical hit integration
 */

"use strict";



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









//--------------------------------
// Services
//--------------------------------


const statStage =
    new StatStageService();



const statusEffect =
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

        statusEffect

    );



const typeEffectiveness =
    new TypeEffectivenessService();



const damageCalculation =
    new DamageCalculationService(

        typeEffectiveness,

        statusEffect

    );



const moveService =
    new MoveExecutionService(
    
        moveMechanics,
    
        moveEffect,
    
        damageCalculation,
    
        statusEffect
    
    );









console.log();

console.log(
"================================"
);

console.log(
"Move Execution Tests"
);

console.log(
"================================"
);









//--------------------------------
// Pokemon
//--------------------------------


const charizard =
{

    species:
        "CHARIZARD",


    type:
    [

        "FIRE",

        "FLYING"

    ],


    level:
        50,


    hp:
        150,


    maxHP:
        150,


    attack:
        84,


    defense:
        78,


    spAttack:
        109,


    spDefense:
        85,


    friendship:
        255,


    ivs:
    {

        hp:31,

        attack:31,

        defense:31,

        speed:31,

        spAttack:31,

        spDefense:31

    },


    statStages:
    {

        attack:0,

        defense:0,

        speed:0,

        spAttack:0,

        spDefense:0,

        accuracy:0,

        evasion:0

    }

};









const blastoise =
{

    species:
        "BLASTOISE",


    type:
    [

        "WATER"

    ],


    level:
        50,


    hp:
        160,


    maxHP:
        160,


    attack:
        83,


    defense:
        100,


    spAttack:
        85,


    spDefense:
        105,


    friendship:
        70,


    statStages:
    {

        attack:0,

        defense:0,

        speed:0,

        spAttack:0,

        spDefense:0,

        accuracy:0,

        evasion:0

    }

};









//--------------------------------
// Flamethrower
//--------------------------------


const flamethrower =
{

    name:
        "FLAMETHROWER",


    constant:
        "MOVE_FLAMETHROWER",


    type:
        "FIRE",


    category:
        "SPECIAL",


    power:
        95,


    accuracy:
        100

};





console.log();

console.log(
"Flamethrower:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        flamethrower

    )

);









//--------------------------------
// Hidden Power
//--------------------------------


console.log();

console.log(
"Hidden Power:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        {

            constant:
                "MOVE_HIDDEN_POWER",

            category:
                "SPECIAL"

        }

    )

);









//--------------------------------
// Weather Ball
//--------------------------------


console.log();

console.log(
"Weather Ball Rain:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        {

            constant:
                "MOVE_WEATHER_BALL",

            category:
                "SPECIAL"

        },

        {

            weather:
                "RAIN"

        }

    )

);









//--------------------------------
// Nature Power
//--------------------------------


console.log();

console.log(
"Nature Power Cave:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        {

            constant:
                "MOVE_NATURE_POWER",

            category:
                "SPECIAL"

        },

        {

            environment:
                "CAVE"

        }

    )

);









//--------------------------------
// Magnitude
//--------------------------------


console.log();

console.log(
"Magnitude:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        {

            constant:
                "MOVE_MAGNITUDE"

        }

    )

);









//--------------------------------
// Return
//--------------------------------


console.log();

console.log(
"Return:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        {

            constant:
                "MOVE_RETURN"

        },

        {

            pokemon:
                charizard

        }

    )

);









//--------------------------------
// Thunder Wave
//--------------------------------


console.log();

console.log(
"Thunder Wave:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        {

            constant:
                "MOVE_THUNDER_WAVE",


            effect:
                "STATUS",


            status:
                "PARALYSIS",


            power:
                0,


            accuracy:
                100

        }

    )

);









//--------------------------------
// Swords Dance
//--------------------------------


console.log();

console.log(
"Swords Dance:"
);



console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        {

            constant:
                "MOVE_SWORDS_DANCE",


            effect:
                "STAT_CHANGE",


            target:
                "SELF",


            power:
                0,


            accuracy:
                100,


            changes:
            [

                {

                    stat:
                        "attack",

                    amount:
                        2

                }

            ]

        }

    )

);









console.log();

console.log(
"Charizard Attack Stage:"
);



console.log(

    charizard.statStages.attack

);









//--------------------------------
// Stat Stage Damage Test
//--------------------------------


const boostedCharizard =
{

    ...charizard

};


boostedCharizard.statStages.attack = 2;





const testBlastoise =
{

    ...blastoise,


    hp:
        160

};





const slash =
{

    name:
        "SLASH",


    constant:
        "MOVE_SLASH",


    type:
        "NORMAL",


    category:
        "PHYSICAL",


    power:
        70,


    accuracy:
        100

};





console.log();

console.log(
"Stat Stage Damage Test:"
);



console.log(
"Slash with +2 Attack:"
);



console.log(

    moveService.executeMove(

        boostedCharizard,

        testBlastoise,

        slash

    )

);









//--------------------------------
// Burn Damage Test
//--------------------------------


const burnedCharizard =
{

    ...charizard,


    hp:
        150,


    status:
        "BURN"

};





const burnTarget =
{

    ...blastoise,


    hp:
        160

};





console.log();

console.log(
"Burn Damage Test:"
);



console.log(
"Burned Charizard Slash:"
);



console.log(

    moveService.executeMove(

        burnedCharizard,

        burnTarget,

        slash

    )

);









//--------------------------------
// Move Status Application Test
//--------------------------------

const burnAttacker =
{

    ...charizard,

    hp:
        150,

    status:
        null

};


const burnTargetPokemon =
{

    ...blastoise,

    hp:
        160,

    status:
        null

};


const ember =
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

    status:
        "BURN",

    statusChance:
        100

};


console.log();

console.log(
"Move Status Application Test:"
);


const burnResult =

    moveService.executeMove(

        burnAttacker,

        burnTargetPokemon,

        ember

    );


console.log(
    burnResult
);


console.log();

console.log(
"Burn applied:"
);


console.log(
{

    success:
        burnTargetPokemon.status === "BURN",

    status:
        burnTargetPokemon.status,

    result:
        burnResult.effect

}
);









//--------------------------------
// Burn Critical Test
//--------------------------------


const criticalSlash =
{

    ...slash,


    criticalRate:
        "HIGH"

};





console.log();

console.log(
"Burn Critical Test:"
);



console.log(

    moveService.executeMove(

        burnedCharizard,

        burnTarget,

        criticalSlash

    )

);









//--------------------------------
// Faint check
//--------------------------------


console.log();

console.log(
"Blastoise fainted:"
);



console.log(

    moveService.isFainted(

        blastoise

    )

);









//--------------------------------
// Summary
//--------------------------------


console.log();

console.log(
"Battle summary:"
);



console.log(

    moveService.getResultSummary(

        charizard,

        blastoise,

        flamethrower,

        {

            damage:10,

            move:
                "FLAMETHROWER"

        }

    )

);









//--------------------------------
// Miss test
//--------------------------------


console.log();

console.log(
"Testing miss:"
);



const missMove =
{

    name:
        "TAIL_WHIP",


    constant:
        "MOVE_TAIL_WHIP",


    power:
        0,


    accuracy:
        0

};





console.log(

    moveService.executeMove(

        charizard,

        blastoise,

        missMove

    )

);









console.log();

console.log(
"Move Execution Tests Completed."
);

console.log();