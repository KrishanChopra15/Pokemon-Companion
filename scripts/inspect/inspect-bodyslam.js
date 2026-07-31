const {
    loadBaseMoves,
    loadGenerationOverrides,
} = require('../utils/loaders/showdown');

const base = loadBaseMoves();
const gen1 = loadGenerationOverrides(1);
const gen2 = loadGenerationOverrides(2);
const gen5 = loadGenerationOverrides(5);
console.log("doubleslap: Base, gen1, gen2")
console.log(base.doubleslap);
console.log(gen1.doubleslap);
console.log(gen2.doubleslap);