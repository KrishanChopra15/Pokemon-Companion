"use strict";


const StatCalculationService =
    require("../scripts/services/stat-calculation-service");


const StatStageService =
    require("../scripts/services/stat-stage-service");


const AbilityService =
    require("../scripts/services/ability-service");





console.log();


console.log(
"==============================="
);

console.log(
"Stat Calculation Service Test"
);

console.log(
"==============================="
);







//================================
// Services
//================================


const statStage =
    new StatStageService();



const ability =
    new AbilityService();



const statCalculation =
    new StatCalculationService(

        statStage,

        ability

    );









//================================
// Test Pokémon
//================================


const charizard =
{

    species:
        "Charizard",


    level:
        50,


    ability:
        null,


    baseStats:
    {

        hp:
            78,


        attack:
            84,


        defense:
            78,


        spAttack:
            109,


        spDefense:
            85,


        speed:
            100

    },


    status:
        null


};








const blastoise =
{

    species:
        "Blastoise",


    level:
        50,


    ability:
        null,


    baseStats:
    {

        hp:
            79,


        attack:
            83,


        defense:
            100,


        spAttack:
            85,


        spDefense:
            105,


        speed:
            78

    },


    status:
        null


};









//================================
// Initial Stats
//================================


console.log();


console.log(
"Charizard Stats:"
);



console.log(

    statCalculation.calculateStats(
        charizard
    )

);









//================================
// Attack Stage
//================================


console.log();


console.log(
"Increase Attack +2:"
);



console.log(

    statStage.increase(

        charizard,

        "attack",

        2

    )

);





console.log();


console.log(
"Modified Attack:"
);



console.log(

    statCalculation.calculateStat(

        charizard,

        "attack"

    )

);









//================================
// Agility
//================================


console.log();


console.log(
"Use Agility Speed +2:"
);



console.log(

    statStage.increase(

        charizard,

        "speed",

        2

    )

);





console.log();


console.log(
"Modified Speed:"
);



console.log(

    statCalculation.calculateSpeed(

        charizard

    )

);









//================================
// Paralysis
//================================


console.log();


console.log(
"Apply Paralysis:"
);



charizard.status =
    "PARALYSIS";





console.log();


console.log(
"Paralyzed Speed:"
);



console.log(

    statCalculation.calculateSpeed(

        charizard

    )

);









//================================
// Ability Test
//================================


console.log();


console.log(
"Ability Test:"
);



const azumarill =
{

    species:
        "Azumarill",


    level:
        50,


    ability:
        "HUGE_POWER",


    baseStats:
    {

        hp:
            100,


        attack:
            50,


        defense:
            80,


        spAttack:
            60,


        spDefense:
            80,


        speed:
            50

    },


    status:
        null


};





console.log();


console.log(
"Azumarill Normal Stats:"
);



console.log(

    statCalculation.calculateStats(

        azumarill

    )

);








//================================
// Speed Comparison
//================================


console.log();


console.log(
"Speed Comparison:"
);



const faster =
    statCalculation.compareSpeed(

        charizard,

        blastoise

    );




console.log(

    faster
    ?
    faster.species
    :
    "Tie"

);









//================================
// Reset
//================================


console.log();


console.log(
"Completed."
);