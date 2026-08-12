/**
 * Pokémon Companion
 * Wild Encounter Extractor Test
 */

"use strict";


const fs = require("fs");
const path = require("path");

const PokemonEncounterExtractor =
    require("../scripts/extractors/game-boy-advance/pokemon-encounter-extractor");


const wildEncounterFile = path.join(
    __dirname,
    "..",
    "..",
    "References",
    "pokefirered",
    "src",
    "data",
    "wild_encounters.json"
);


const data = JSON.parse(
    fs.readFileSync(
        wildEncounterFile,
        "utf8"
    )
);

const extractor =
    new PokemonEncounterExtractor();


const encounters =
    extractor.extract(data);


console.log(
    "Total encounters:",
    encounters.length
);


console.log(
    encounters[0]
);