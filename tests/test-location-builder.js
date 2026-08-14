/**
 * Pokémon Companion
 * Location Builder Test
 */

"use strict";

const fs = require("fs");
const path = require("path");

const LocationBuilder =
    require("../scripts/builders/location-builder");


const game = "firered";


new LocationBuilder()
    .build(game);



const locations =
    JSON.parse(
        fs.readFileSync(
            path.join(
                __dirname,
                "../database/generated",
                game,
                "locations.json"
            ),
            "utf8"
        )
    );


const pokemonLocations =
    JSON.parse(
        fs.readFileSync(
            path.join(
                __dirname,
                "../database/generated",
                game,
                "pokemon-locations.json"
            ),
            "utf8"
        )
    );



const viridian =
    locations["MAP_VIRIDIAN_FOREST"];



console.log(
    "Viridian Forest:"
);

console.log(
    viridian
);



console.log(
    "\nPikachu locations:"
);

console.log(
    pokemonLocations["PIKACHU"]
);



console.log(
    "\nLocation count:",
    Object.keys(locations).length
);


console.log(
    "Pokémon location count:",
    Object.keys(pokemonLocations).length
);