const {
    loadBaseMoves,
    loadGenerationOverrides,
} = require('../utils/loaders/showdown');

const base = loadBaseMoves();
const gen3 = loadGenerationOverrides(3);
const gen6 = loadGenerationOverrides(6);

console.log('BASE TACKLE');
console.log(base.tackle);

console.log('\nGEN 3 TACKLE');
console.log(gen3.tackle);

console.log('\nGEN 6 TACKLE');
console.log(gen6.tackle);