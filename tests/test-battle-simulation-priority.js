/**
 * Pokémon Companion
 * Battle Simulation Priority Test
 */

"use strict";


const BattleSimulationService =
    require("../scripts/services/battle-simulation-service");



console.log(
    "================================"
);

console.log(
    "Battle Simulation Priority Test"
);

console.log(
    "================================"
);





const service =
    new BattleSimulationService();





console.log(
    "Service Loaded:",
    service !== null
);









const pikachu = {


    species:
        "PIKACHU",


    level:
        20,


    hp:
        50,


    attack:
        35,


    defense:
        30,


    spAttack:
        40,


    spDefense:
        35,


    speed:
        50,


    types:
        [
            "ELECTRIC"
        ]



};









const onix = {


    species:
        "ONIX",


    level:
        20,


    hp:
        60,


    attack:
        45,


    defense:
        100,


    spAttack:
        30,


    spDefense:
        40,


    speed:
        100,


    types:
        [
            "ROCK",
            "GROUND"
        ]



};









const quickAttack = {


    name:
        "QUICK_ATTACK",


    type:
        "NORMAL",


    category:
        "PHYSICAL",


    power:
        40,


    accuracy:
        100,


    priority:
        1



};









const rockThrow = {


    name:
        "ROCK_THROW",


    type:
        "ROCK",


    category:
        "PHYSICAL",


    power:
        50,


    accuracy:
        100,


    priority:
        0



};









console.log();



console.log(
    "PIKACHU:"
);

console.log(
    pikachu
);



console.log();



console.log(
    "ONIX:"
);

console.log(
    onix
);









console.log();



console.log(
    "Testing Move Priority:"
);









const firstPokemon =

    service.determineFirstPokemon(

        pikachu,

        onix,

        quickAttack,

        rockThrow

    );









console.log();



console.log(
    "Move Order Result:"
);



console.log(
    firstPokemon
);









if(
    firstPokemon === "PLAYER"
)
{

    console.log(
        "PASS: Priority move acts first"
    );

}
else
{

    console.log(
        "FAIL: Priority system broken"
    );

}









console.log();



console.log(
    "Expected:"
);



console.log(
    "PLAYER moves first because QUICK_ATTACK has priority 1"
);









console.log();



console.log(
    "================================"
);


console.log(
    "Priority Test Completed"
);


console.log(
    "================================"
);