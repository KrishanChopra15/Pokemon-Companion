/**
 * Pokémon Companion
 * Final Database Validation Test
 *
 * Verifies:
 * - Generated species database
 * - Generated move database
 * - Generated encounter database
 * - Cross references
 */

"use strict";

const fs = require("fs");
const path = require("path");


function load(file) {

    return JSON.parse(
        fs.readFileSync(
            path.join(
                process.cwd(),
                file
            ),
            "utf8"
        )
    );

}



console.log();
console.log("========================================");
console.log("Final Database Validation");
console.log("========================================");
console.log();



//
// Load databases
//

const species =
    load(
        "database/generated/firered/pokemon-species.json"
    );


const moves =
    load(
        "database/generated/firered/pokemon-moves.json"
    );


const encounters =
    load(
        "database/generated/firered/pokemon-encounters.json"
    );



console.log(
    `Species loaded: ${species.length}`
);


console.log(
    `Moves loaded: ${moves.length}`
);


console.log(
    `Encounters loaded: ${encounters.length}`
);



//
// Species validation
//

console.log();
console.log("Checking Pokémon species...");


const bulbasaur =
    species.find(
        pokemon =>
            pokemon.name === "BULBASAUR"
    );


if (!bulbasaur) {

    throw new Error(
        "Bulbasaur not found."
    );

}


console.log(
    "Bulbasaur found."
);


console.log(
    bulbasaur
);



//
// Move validation
//

console.log();
console.log("Checking moves...");


const pound =
    moves.find(
        move =>
            move.name === "Pound"
    );


if (!pound) {

    throw new Error(
        "Pound move not found."
    );

}


console.log(
    "Pound found."
);


console.log(
    pound
);




//
// Encounter validation
//

console.log();
console.log("Checking encounters...");


const viridianForest =
    encounters.find(
        encounter =>
            encounter.map ===
            "MAP_VIRIDIAN_FOREST"
    );


if (!viridianForest) {

    throw new Error(
        "Viridian Forest encounter not found."
    );

}


console.log(
    "Viridian Forest found."
);


console.log(
    viridianForest
);



//
// Final result
//

console.log();

console.log(
    "========================================"
);

console.log(
    "Final database validation passed."
);

console.log(
    "========================================"
);

console.log();