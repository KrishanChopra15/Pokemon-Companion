/**
 * Pokémon Companion
 * NPC Service Test
 */

"use strict";


const NPCService =
    require("../scripts/services/npc-service");



const npcs =
    new NPCService(
        "firered"
    );



console.log(
    "================================"
);

console.log(
    "NPC Service Test"
);

console.log(
    "================================"
);



console.log();

console.log(
    "=== Cinnabar Pokemon Center NPCs ==="
);


console.log(
    JSON.stringify(
        npcs.getNPCs(
            "MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F"
        ),
        null,
        4
    )
);



console.log();

console.log(
    "=== Find Bill ==="
);



console.log(
    JSON.stringify(
        npcs.getNPC(
            "CinnabarIsland_PokemonCenter_1F_EventScript_Bill"
        ),
        null,
        4
    )
);