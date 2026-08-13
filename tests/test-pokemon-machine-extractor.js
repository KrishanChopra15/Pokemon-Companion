"use strict";

const PokemonMachineExtractor =
require("../scripts/extractors/game-boy-advance/pokemon-machine-extractor");


const extractor =
new PokemonMachineExtractor();


const machines =
extractor.extractAll();


console.log("Total species:", machines.length);

console.log();

console.log("First entry:");

console.log(
    JSON.stringify(
        machines[0],
        null,
        4
    )
);

console.log();

console.log("Eevee:");

const eevee =
machines.find(
    entry =>
        entry.species === "SPECIES_EEVEE"
);

console.log(
    JSON.stringify(
        eevee,
        null,
        4
    )
);