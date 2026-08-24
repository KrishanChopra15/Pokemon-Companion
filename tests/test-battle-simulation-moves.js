const AppContainer =
require("../scripts/app-container");


const container =
new AppContainer();


const simulation =
container.get(
    "battleSimulation"
);



const charmander =
{
    species:"CHARMANDER",
    level:10,
    attack:18,
    types:["FIRE"]
};



const geodude =
{
    species:"GEODUDE",
    level:10,
    defense:31,
    types:["ROCK","GROUND"]
};



const ember =
{
    name:"EMBER",

    type:"FIRE",

    power:40,

    category:"SPECIAL",

    status:"BURN",

    statusChance:10
}



console.log(
    simulation.calculateSimulationDamage(
        charmander,
        geodude,
        ember
    )
);