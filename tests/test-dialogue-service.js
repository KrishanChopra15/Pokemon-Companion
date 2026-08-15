"use strict";


const DialogueService =
    require("../scripts/services/dialogue-service");



const dialogues =
    new DialogueService(
        "firered"
    );



console.log(
    "=============================="
);

console.log(
    "Dialogue Service Test"
);

console.log(
    "=============================="
);



console.log();



console.log(
    "=== Find Bill Dialogue ==="
);



const bill =
    dialogues.getDialogue(
        "Route25_SeaCottage_Text_ImBillHelpMeOutPal"
    );



console.log(
    JSON.stringify(
        bill,
        null,
        4
    )
);



console.log();



console.log(
    "=== Search Bill ==="
);



console.log(
    dialogues.search(
        "Bill"
    )
    .length
);