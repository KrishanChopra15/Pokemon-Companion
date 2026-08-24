"use strict";


const AbilityService =
    require("../scripts/services/ability-service");



console.log();


console.log(
"==============================="
);

console.log(
"Ability Service Test"
);

console.log(
"==============================="
);






const ability =
    new AbilityService();









//================================
// Huge Power Test
//================================


const azumarill =
{

    species:
        "Azumarill",


    ability:
        "HUGE_POWER",


    maxHP:
        200


};



console.log();


console.log(
"Huge Power Attack Modifier:"
);



console.log(

    ability.modifyAttack(

        azumarill,

        100

    )

);









//================================
// Pure Power Test
//================================


const medicham =
{

    species:
        "Medicham",


    ability:
        "PURE_POWER"


};



console.log();


console.log(
"Pure Power Attack Modifier:"
);



console.log(

    ability.modifyAttack(

        medicham,

        120

    )

);









//================================
// Slow Start Test
//================================


const regigigas =
{

    species:
        "Regigigas",


    ability:
        "SLOW_START"


};



console.log();


console.log(
"Slow Start Attack Modifier:"
);



console.log(

    ability.modifyAttack(

        regigigas,

        200

    )

);




console.log();


console.log(
"Slow Start Speed Modifier:"
);



console.log(

    ability.modifySpeed(

        regigigas,

        100

    )

);









//================================
// Immunity Tests
//================================


const flygon =
{

    species:
        "Flygon",


    ability:
        "LEVITATE"


};



console.log();


console.log(
"Levitate Ground Immunity:"
);



console.log(

    ability.isImmune(

        flygon,

        "TYPE_GROUND"

    )

);









//================================
// Absorb Ability Tests
//================================


const vaporeon =
{

    species:
        "Vaporeon",


    ability:
        "WATER_ABSORB",


    maxHP:
        240


};



console.log();


console.log(
"Water Absorb:"
);



console.log(

    ability.absorbMove(

        vaporeon,

        "TYPE_WATER"

    )

);









//================================
// Type Boost Test
//================================


const arcanine =
{

    species:
        "Arcanine",


    ability:
        "FLASH_FIRE"


};



console.log();


console.log(
"Flash Fire Boost:"
);



console.log(

    ability.boostsType(

        arcanine,

        "TYPE_FIRE"

    )

);









//================================
// Stat Protection
//================================


const metagross =
{

    species:
        "Metagross",


    ability:
        "CLEAR_BODY"


};



console.log();


console.log(
"Clear Body Prevent Defense Drop:"
);



console.log(

    ability.preventsStatDrop(

        metagross,

        "defense"

    )

);









console.log();