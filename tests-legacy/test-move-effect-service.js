"use strict";


const MoveEffectService =
    require("../scripts/services/move-effect-service");


const StatStageService =
    require("../scripts/services/stat-stage-service");


const StatusEffectService =
    require("../scripts/services/status-effect-service");





const statStage =
    new StatStageService();



const statusEffect =
    new StatusEffectService();



const service =
    new MoveEffectService(

        statStage,

        statusEffect

    );







console.log();


console.log(
"==============================="
);

console.log(
"Move Effect Service Test"
);

console.log(
"==============================="
);









//================================
// Test Pokémon
//================================


const charizard =
{

    species:
        "Charizard",


    type:
    [

        "FIRE",

        "FLYING"

    ],


    hp:
        150,


    maxHP:
        150,


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





const gengar =
{

    species:
        "Gengar",


    type:
    [

        "GHOST",

        "POISON"

    ],


    hp:
        120,


    maxHP:
        120,


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









//================================
// Stat Change
//================================


console.log();


console.log(
"Dragon Dance Style Stat Change:"
);



console.log(

    service.applyEffect(

        {

            effect:
                "STAT_CHANGE",


            target:
                "SELF",


            changes:
            [

                {

                    stat:
                        "attack",

                    amount:
                        2

                },

                {

                    stat:
                        "speed",

                    amount:
                        1

                }

            ]

        },


        charizard,

        gengar

    )

);









console.log();


console.log(
"Charizard Stages:"
);



console.log(

    charizard.statStages

);









//================================
// Status Effect
//================================


console.log();


console.log(
"Thunder Wave:"
);



console.log(

    service.applyEffect(

        {

            effect:
                "STATUS",


            status:
                "PARALYSIS"

        },


        charizard,

        gengar

    )

);









//================================
// Forced Switch
//================================


console.log();


console.log(
"Roar:"
);



console.log(

    service.applyEffect(

        {

            effect:
                "FORCED_SWITCH"

        },


        charizard,

        gengar,

        {}

    )

);









//================================
// Ghost Curse
//================================


console.log();


console.log(
"Ghost Curse:"
);



console.log(

    service.applyEffect(

        {

            effect:
                "CURSE"

        },


        gengar,

        charizard

    )

);





console.log();


console.log(
"Gengar HP After Curse:"
);



console.log(

    gengar.hp

);









//================================
// Normal Curse
//================================


console.log();


console.log(
"Normal Curse:"
);



console.log(

    service.applyEffect(

        {

            effect:
                "CURSE"

        },


        charizard,

        gengar

    )

);









console.log();


console.log(
"Completed."
);