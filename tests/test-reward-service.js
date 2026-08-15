"use strict";


const TrainerState =
    require("../scripts/domain/trainer-state");


const RewardService =
    require("../scripts/services/reward-service");



console.log(
    "=============================="
);

console.log(
    "Reward Service Test"
);

console.log(
    "=============================="
);



const trainer =
    new TrainerState();



const rewards =
{

    addItems:
    [
        {
            name:"POTION",
            quantity:3
        }
    ],



    addPokemon:
    [
        {
            species:"LAPRAS",
            level:25
        }
    ],



    addMoney:
    [
        5000
    ],



    addStoryFlags:
    [
        "SILPH_CO_COMPLETED"
    ]

};



const service =
    new RewardService();



const result =
    service.execute(
        rewards,
        trainer
    );



console.log(
    result
);