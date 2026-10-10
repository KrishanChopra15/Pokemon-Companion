/**
 * Pokémon Companion
 * Encounter Generator Test
 */

"use strict";


const fs = require("fs");
const path = require("path");


const PokemonEncounterExtractor =
require("../scripts/extractors/game-boy-advance/pokemon-encounter-extractor");


const PokemonEncounterGenerator =
require("../scripts/generators/raw/pokemon-encounter-generator");



const file = path.join(

    __dirname,

    "..",
    "..",

    "References",

    "pokefirered",

    "src",

    "data",

    "wild_encounters.json"

);



const source = JSON.parse(

    fs.readFileSync(
        file,
        "utf8"
    )

);



const extractor =
    new PokemonEncounterExtractor();



const encounters =
    extractor.extract(source);



const generator =
    new PokemonEncounterGenerator();



generator.generate(
    encounters
);