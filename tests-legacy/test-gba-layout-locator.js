"use strict";

const path = require("path");

const Platform = require("../scripts/domain/platform");
const Source = require("../scripts/shared/source-manager/source");

const GameBoyAdvanceReader = require(
    "../scripts/readers/game-boy-advance/gba-reader"
);

const GbaLayoutLocator = require(
    "../scripts/binary-layouts/game-boy-advance/gba-layout-locator"
);

//------------------------------------------------------
// Create source
//------------------------------------------------------

const source = new Source({

    platform: new Platform({

        id: "game-boy-advance",

        name: "Game Boy Advance"

    }),

    fileName: "Pokemon FireRed.gba",

    extension: ".gba",

    platformDirectory: "",

    absolutePath: path.resolve(
        "roms/Pokemon FireRed.gba"
    ),

    relativePath: "",

    size: 0

});

//------------------------------------------------------
// Read ROM
//------------------------------------------------------

const reader = new GameBoyAdvanceReader(source);

reader.open();

//------------------------------------------------------
// Locate tables
//------------------------------------------------------

const locator = new GbaLayoutLocator(reader);

const offset = locator.findPokemonSpeciesTable();

console.log();

console.log(
    "Pokemon Species Table"
);

console.log(
    "Decimal :", offset
);

console.log(
    "Hex     : 0x" + offset.toString(16).toUpperCase()
);

console.log();

reader.close();