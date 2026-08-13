const fs = require("fs");
const path = require("path");


const SOURCE = path.join(
    __dirname,
    "../../../../References/pokefirered/src/data/trainer_parties.h"
);


const OUTPUT = path.join(
    __dirname,
    "../../../database/raw/firered/trainer-parties.json"
);


// Read source file
const text = fs.readFileSync(SOURCE, "utf8");


// Only parse actual FireRed trainer data
const startMarker = "// Start of actual trainer data";

const startIndex = text.indexOf(startMarker);

if (startIndex === -1) {
    throw new Error("Could not find start of actual trainer data");
}

const trainerData = text.slice(startIndex);


// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT), {
    recursive: true
});


const parties = {};


// Match trainer party definitions
const partyRegex =
/static const struct ([A-Za-z0-9_]+) (sParty_[A-Za-z0-9]+)\[\] = \{([\s\S]*?)\};/g;


let match;


while ((match = partyRegex.exec(trainerData)) !== null) {

    const structType = match[1];
    const partyName = match[2];
    const body = match[3];


    const pokemon = [];


    const pokemonRegex =
    /(?:\.iv = (\d+),\s*)?\.lvl = (\d+),\s*\.species = SPECIES_([A-Z0-9_]+)/g;


    let mon;


    while ((mon = pokemonRegex.exec(body)) !== null) {

        pokemon.push({
            species: mon[3],
            level: Number(mon[2]),
            iv: mon[1] ? Number(mon[1]) : 0
        });

    }


    parties[partyName] = {
        structType,
        pokemon
    };
}


fs.writeFileSync(
    OUTPUT,
    JSON.stringify(parties, null, 2)
);


console.log(
    `Generated ${Object.keys(parties).length} trainer parties`
);