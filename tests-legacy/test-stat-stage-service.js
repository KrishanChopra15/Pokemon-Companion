"use strict";


const StatStageService =
    require("../scripts/services/stat-stage-service");



const service =
    new StatStageService();





console.log();


console.log(
"==============================="
);

console.log(
"Stat Stage Service Test"
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


    stats:
    {

        attack:
            84,


        defense:
            78,


        speed:
            100,


        spAttack:
            109,


        spDefense:
            85

    }

};








console.log();


console.log(
"Initial Stages:"
);


console.log(

    service.getAllStages(
        charizard
    )

);








//================================
// Increase Attack
//================================


console.log();


console.log(
"Increase Attack +1:"
);


console.log(

    service.increase(

        charizard,

        "attack",

        1

    )

);






console.log();


console.log(
"Attack Stage:"
);


console.log(

    service.getStage(

        charizard,

        "attack"

    )

);









//================================
// Agility Test
//================================


console.log();


console.log(
"Use Agility (Speed +2):"
);


console.log(

    service.increase(

        charizard,

        "speed",

        2

    )

);






console.log();


console.log(
"Speed Stage:"
);


console.log(

    service.getStage(

        charizard,

        "speed"

    )

);








console.log();


console.log(
"Modified Speed:"
);


console.log(

    service.getModifiedStat(

        charizard,

        "speed",

        charizard.stats.speed

    )

);









//================================
// Maximum Stage Test
//================================


console.log();


console.log(
"Increase Defense +10:"
);


console.log(

    service.increase(

        charizard,

        "defense",

        10

    )

);






console.log();


console.log(
"Defense Stage:"
);


console.log(

    service.getStage(

        charizard,

        "defense"

    )

);









//================================
// Minimum Stage Test
//================================


console.log();


console.log(
"Decrease Accuracy -10:"
);


console.log(

    service.decrease(

        charizard,

        "accuracy",

        10

    )

);






console.log();


console.log(
"Accuracy Stage:"
);


console.log(

    service.getStage(

        charizard,

        "accuracy"

    )

);









//================================
// Reset
//================================


console.log();


console.log(
"Reset Stages:"
);


console.log(

    service.reset(
        charizard
    )

);






console.log();


console.log(
"After Reset:"
);


console.log(

    service.getAllStages(
        charizard
    )

);









console.log();


console.log(
"Completed."
);