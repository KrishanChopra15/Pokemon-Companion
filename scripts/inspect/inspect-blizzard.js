const {
    loadBaseMoves,
    loadGenerationOverrides,
} = require('../utils/loaders/showdown');

const base = loadBaseMoves();
const gen1 = loadGenerationOverrides(1);
const gen3 = loadGenerationOverrides(3);
const gen5 = loadGenerationOverrides(5);
const gen8 = loadGenerationOverrides(8);

console.log('BASE');
console.log(base.blizzard);

console.log('\nGEN 1');
console.log(gen1.blizzard);

console.log('\nGEN 3');
console.log(gen3.blizzard);

console.log('\nGEN 5');
console.log(gen5.blizzard);

console.log('\nGEN 8');
console.log(gen8.blizzard);