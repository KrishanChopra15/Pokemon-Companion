const GbaReader = require("../scripts/readers/game-boy-advance/gba-reader");
const GbaRomScanner = require("../scripts/readers/game-boy-advance/gba-rom-scanner");

const reader = new GbaReader(/* your ROM */);
const scanner = new GbaRomScanner(reader);

const offset = scanner.find(Buffer.from([
    45, 49, 49, 45, 65, 65
]));

console.log(offset.toString(16));