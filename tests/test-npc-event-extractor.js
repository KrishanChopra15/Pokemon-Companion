"use strict";

const path = require("path");

const NPCEventExtractor =
    require("../scripts/extractors/game-boy-advance/npc-event-extractor");


const extractor =
    new NPCEventExtractor();



const sourcePath =
    path.join(
        __dirname,
        "../../pokefirered"
    );



const result =
    extractor.extract(
        "/Users/krishanchopra/Coding/Pokemon-project/References/pokefirered"
    );



console.log(
    "================================"
);

console.log(
    "NPC Event Extractor Test"
);

console.log(
    "================================"
);



console.log(
    "Total locations:",
    Object.keys(result).length
);



console.log();



console.log(
    "=== Cinnabar Pokemon Center NPCs ==="
);



console.log(
    JSON.stringify(
        result[
            "MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F"
        ],
        null,
        4
    )
);