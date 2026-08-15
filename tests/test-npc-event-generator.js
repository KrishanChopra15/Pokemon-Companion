/**
 * Pokémon Companion
 * NPC Event Generator Test
 */

"use strict";


const NPCEventExtractor =
    require("../scripts/extractors/game-boy-advance/npc-event-extractor");


const NPCEventGenerator =
    require("../scripts/generators/raw/npc-event-generator");



const extractor =
    new NPCEventExtractor();


const generator =
    new NPCEventGenerator();



const extracted =
    extractor.extract(
        "/Users/krishanchopra/Coding/Pokemon-project/References/pokefirered"
    );



const generated =
    generator.generate(
        extracted
    );



console.log(
    "================================"
);

console.log(
    "NPC Event Generator Test"
);

console.log(
    "================================"
);



console.log();

console.log(
    "=== Generated Cinnabar Pokemon Center NPCs ==="
);


console.log(
    JSON.stringify(
        generated[
            "MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F"
        ],
        null,
        4
    )
);