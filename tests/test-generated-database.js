/**
 * Pokémon Companion
 * Generated Database Test
 *
 * Verifies:
 * - Generated Pokémon species database.
 * - Generated Pokémon moves database.
 * - Final merged data correctness.
 */

"use strict";

const fs = require("fs");
const path = require("path");


try {


    const speciesFile = path.join(
        process.cwd(),
        "database",
        "generated",
        "firered",
        "pokemon-species.json"
    );


    const movesFile = path.join(
        process.cwd(),
        "database",
        "generated",
        "firered",
        "pokemon-moves.json"
    );


    const species = JSON.parse(
        fs.readFileSync(
            speciesFile,
            "utf8"
        )
    );


    const moves = JSON.parse(
        fs.readFileSync(
            movesFile,
            "utf8"
        )
    );


    console.log(
        "Species:",
        species.length
    );


    console.log(
        "Moves:",
        moves.length
    );


    //--------------------------------
    // Species checks
    //--------------------------------

    const bulbasaur = species.find(
        p => p.name === "BULBASAUR"
    );


    if (!bulbasaur) {
        throw new Error(
            "Bulbasaur not found"
        );
    }


    console.log(
        "Bulbasaur found"
    );


    if (bulbasaur.type1.name !== "Grass") {
        throw new Error("Incorrect Bulbasaur type");
    }
    
    if (bulbasaur.evolutions[0].level !== 16) {
        throw new Error("Incorrect evolution level");
    }
    
    if (bulbasaur.learnset[0].move.name !== "Tackle") {
        throw new Error("Incorrect learnset");
    }


    //--------------------------------
    // Move checks
    //--------------------------------


    const pound = moves.find(
        m => m.name === "Pound"
    );


    if (!pound) {

        throw new Error(
            "Pound not found"
        );

    }


    console.log(
        "Pound found"
    );


    console.log(
        pound
    );


    console.log();

    console.log(
        "Generated database test passed."
    );


}
catch(error) {

    console.error(error);

}