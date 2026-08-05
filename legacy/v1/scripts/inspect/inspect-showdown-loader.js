const {
    loadBaseMoves,
    loadGenerationOverrides,
} = require('../utils/loaders/showdown');

const base = loadBaseMoves();
const gen1 = loadGenerationOverrides(1);
const gen5 = loadGenerationOverrides(5);

console.log(base.blizzard);
console.log(gen1.blizzard);
console.log(gen5.blizzard);