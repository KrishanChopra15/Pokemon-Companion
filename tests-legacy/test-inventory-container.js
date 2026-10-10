"use strict";


const AppContainer =
    require("../scripts/app-container");



const container =
    new AppContainer();



const inventory =
    container.get(
        "inventoryFlow"
    );



console.log(
    "Inventory Container:",
    Boolean(inventory)
);



const result =
    inventory.receiveItem(
        "POKE_BALL",
        10
    );



console.log(
    "Add:",
    result.success
);



console.log(
    "Pokeballs:",
    inventory.getQuantity(
        "POKE_BALL"
    )
);