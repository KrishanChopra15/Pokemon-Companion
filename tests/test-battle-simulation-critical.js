/**
 * Pokémon Companion
 * Battle Simulation Critical Hit Test
 */

"use strict";


const BattleSimulationService =
    require("../scripts/services/battle-simulation-service");



console.log(
    "================================"
);

console.log(
    "Battle Simulation Critical Test"
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









const charmander = {


    species:
        "CHARMANDER",


    level:
        12,


    hp:
        35,


    attack:
        20,


    defense:
        18,


    spAttack:
        24,


    spDefense:
        20,


    speed:
        25,


    types:
        [
            "FIRE"
        ]



};









const bulbasaur = {


    species:
        "BULBASAUR",


    level:
        12,


    hp:
        38,


    attack:
        18,


    defense:
        20,


    spAttack:
        22,


    spDefense:
        25,


    speed:
        18,


    types:
        [
            "GRASS"
        ]



};









const ember = {


    name:
        "EMBER",


    type:
        "FIRE",


    category:
        "SPECIAL",


    power:
        40,


    accuracy:
        100


};









console.log();


console.log(
    "CHARMANDER:"
);

console.log(
    charmander
);



console.log();



console.log(
    "BULBASAUR:"
);

console.log(
    bulbasaur
);









console.log();



console.log(
    "Testing Critical Hits:"
);









let results = [];

let criticalHits = 0;



const simulations = 100;





for(
    let i = 0;
    i < simulations;
    i++
)
{


    const result =

        service.calculateSimulationDamage(

            charmander,

            bulbasaur,

            ember

        );





    results.push(
        result
    );





    if(
        result.critical
    )
    {

        criticalHits++;

    }


}









console.log();



console.log(
    "Damage Results:"
);


console.log(
    results
);









console.log();



console.log(
    "Critical Hits:",
    criticalHits
);









const totalDamage =

    results.reduce(

        (
            total,
            result
        ) =>

            total + result.damage,

        0

    );





const averageDamage =

    totalDamage /

    results.length;









console.log();



console.log(
    "Average Damage:",
    Math.round(
        averageDamage
    )
);









console.log();



console.log(
    "================================"
);


console.log(
    "Critical Hit Test Completed"
);


console.log(
    "================================"
);