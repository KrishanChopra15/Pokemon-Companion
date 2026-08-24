"use strict";


const AppContainer =
    require("../scripts/app-container");



console.log(
    "================================"
);

console.log(
    "Battle Simulation Scenario Test"
);

console.log(
    "================================"
);



const app =
    new AppContainer(
        "firered"
    );


const container =
    app.getContainer();



const simulation =
    container.get(
        "battleSimulation"
    );



const pokemon = {

    species:
        "CHARMANDER",

    level:
        10,

    hp:
        39,

    attack:
        15,

    defense:
        13,

    spAttack:
        17,

    spDefense:
        15,

    speed:
        18

};



console.log(
    "\nEXACT:"
);

console.log(
    simulation.exact(
        pokemon
    )
);



console.log(
    "\nBEST:"
);

console.log(
    simulation.bestCase(
        pokemon
    )
);



console.log(
    "\nWORST:"
);

console.log(
    simulation.worstCase(
        pokemon
    )
);



console.log(
    "\n================================"
);

console.log(
    "Battle Simulation Scenario Test Completed"
);

console.log(
    "================================"
);