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
    attack:18
};



const geodude =
{
    species:"GEODUDE",
    level:10,
    defense:31
};



console.log(
    simulation.calculateSimulationDamage(
        charmander,
        geodude
    )
);