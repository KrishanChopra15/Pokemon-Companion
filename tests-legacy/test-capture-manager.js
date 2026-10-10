"use strict";


const CaptureManager =
    require("../scripts/capture/capture-manager");



const captures =
    new CaptureManager();



console.log(
    "Capture Manager:",
    Boolean(captures)
);





const result =
    captures.addCapture(
        "RATTATA"
    );



console.log(
    "Add Capture:",
    result.success
);



console.log(
    "Pokemon:",
    result.capture.pokemon
);



console.log(
    "Count:",
    captures.getCount()
);



console.log(
    "Has RATTATA:",
    captures.hasPokemon(
        "RATTATA"
    )
);