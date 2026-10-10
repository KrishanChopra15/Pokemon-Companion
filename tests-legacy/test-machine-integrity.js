"use strict";

const fs = require("fs");
const path = require("path");

const PokemonMachineExtractor =
require("../scripts/extractors/game-boy-advance/pokemon-machine-extractor");


const machineData =
new PokemonMachineExtractor().extractAll();


const speciesFile =
path.join(
    process.cwd(),
    "database",
    "reference",
    "species-names.json"
);


const species =
JSON.parse(
    fs.readFileSync(
        speciesFile,
        "utf8"
    )
);


const speciesConstants =
new Set(
    species.map(
        s => s.constant
    )
);


let missing = [];


for (const entry of machineData) {

    if (!speciesConstants.has(entry.species)) {

        missing.push(entry.species);

    }

}


console.log(
    "Missing species:"
);

console.log(missing);

console.log();

console.log(
    "Missing count:",
    missing.length
);