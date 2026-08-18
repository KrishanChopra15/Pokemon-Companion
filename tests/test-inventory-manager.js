"use strict";


const InventoryManager =
    require("../scripts/inventory/inventory-manager");


const InventoryFlow =
    require("../scripts/inventory/inventory-flow");





const manager =
    new InventoryManager();



const flow =
    new InventoryFlow(
        manager
    );





console.log(
    "Inventory Manager:",
    Boolean(manager)
);



console.log(
    "Inventory Flow:",
    Boolean(flow)
);





const add =
    flow.receiveItem(
        "POKE_BALL",
        5
    );



console.log(
    "Add Item:",
    add.success
);



console.log(
    "Quantity:",
    flow.getQuantity(
        "POKE_BALL"
    )
);





const use =
    flow.useItem(
        "POKE_BALL"
    );



console.log(
    "Use Item:",
    use.success
);



console.log(
    "Remaining:",
    flow.getQuantity(
        "POKE_BALL"
    )
);



console.log(
    "History:",
    flow.getHistory()
        .length
);