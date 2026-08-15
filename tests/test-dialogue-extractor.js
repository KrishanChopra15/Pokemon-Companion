"use strict";


const DialogueExtractor =
    require("../scripts/extractors/game-boy-advance/dialogue-extractor");


const path =
    require("path");



const extractor =
    new DialogueExtractor();



const referencePath =
    path.resolve(
        __dirname,
        "../../References/pokefirered"
    );



const dialogues =
    extractor.extract(
        referencePath
    );



console.log(
    "=============================="
);

console.log(
    "Dialogue Extractor Test"
);

console.log(
    "=============================="
);



console.log();

console.log(
    "Total dialogues:",
    Object.keys(dialogues).length
);



console.log();

console.log(
    "=== Bill Related Dialogues ==="
);



let found = 0;



for(
    const id of Object.keys(dialogues)
) {


    if(
        id.toLowerCase().includes("bill")
    ) {


        console.log();

        console.log(
            "ID:",
            id
        );


        console.log(
            "TEXT:"
        );


        console.log(
            dialogues[id].text
        );


        found++;


    }


}



console.log();

console.log(
    "Bill dialogue count:",
    found
);