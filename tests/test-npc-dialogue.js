"use strict";


const fs =
require("fs");


const path =
require("path");



const database =
JSON.parse(
    fs.readFileSync(
        path.join(
            __dirname,
            "../database/raw/firered/npc-dialogues.json"
        ),
        "utf8"
    )
);



console.log(
"=============================="
);

console.log(
"NPC Dialogue Test"
);

console.log(
"=============================="
);



const bill =
database[
"CinnabarIsland_PokemonCenter_1F_EventScript_Bill"
];



console.log(
JSON.stringify(
    bill,
    null,
    4
)
);